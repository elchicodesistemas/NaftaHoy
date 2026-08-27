import axios from "axios";
import csv from "csv-parser";
import { Readable } from "stream";
import { prisma } from "../config/prisma";
import { config } from "../config";

interface RawGovRecord {
  indice_tiempo?: string;
  idempresa?: string;
  cuit?: string;
  empresa?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  region?: string;
  idproducto?: string;
  producto?: string;
  idtipohorario?: string;
  tipohorario?: string;
  precio?: string;
  fecha_vigencia?: string;
  idempresabandera?: string;
  empresabandera?: string;
  latitud?: string;
  longitud?: string;
  geojson?: string;
}

export interface NormalizedBrand {
  id: string;
  name: string;
}

export interface NormalizedProduct {
  type: string;
  name: string;
}

export class GovIngestionService {
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private cachedSummary: any = null;

  public normalizeBrand(rawBrand: string | undefined): NormalizedBrand {
    if (!rawBrand) return { id: "blanca", name: "Sin Bandera" };
    const b = rawBrand.toUpperCase().trim();
    if (b.includes("YPF")) return { id: "ypf", name: "YPF" };
    if (b.includes("SHELL")) return { id: "shell", name: "Shell" };
    if (b.includes("AXION") || b.includes("ESSO")) return { id: "axion", name: "Axion Energy" };
    if (b.includes("PUMA")) return { id: "puma", name: "Puma Energy" };
    if (b.includes("DAPSA")) return { id: "dapsa", name: "DAPSA" };
    if (b.includes("GULF")) return { id: "gulf", name: "Gulf" };
    if (b.includes("REFINOR")) return { id: "refinor", name: "Refinor" };
    if (b.includes("VOY")) return { id: "voy", name: "Voy con Energía" };
    return { id: "blanca", name: rawBrand };
  }

  public normalizeProduct(rawProduct: string | undefined): NormalizedProduct | null {
    if (!rawProduct) return null;
    const p = rawProduct.toLowerCase().trim();
    if (p.includes("súper") || p.includes("super") || (p.includes("nafta") && p.includes("92"))) {
      return { type: "SUPER", name: "Nafta Súper" };
    }
    if (p.includes("premium") || p.includes("infinia") || p.includes("v-power") || (p.includes("nafta") && p.includes("95"))) {
      return { type: "PREMIUM", name: "Nafta Premium" };
    }
    if (p.includes("gas oil grado 2") || p.includes("gasoil grado 2") || p.includes("diesel común") || p.includes("gas oil 2")) {
      return { type: "DIESEL", name: "Diesel" };
    }
    if (p.includes("gas oil grado 3") || p.includes("gasoil grado 3") || p.includes("diesel premium") || p.includes("gas oil 3")) {
      return { type: "DIESEL_PREMIUM", name: "Diesel Premium" };
    }
    if (p.includes("gnc") || p.includes("gas natural")) {
      return { type: "GNC", name: "GNC" };
    }
    return null;
  }

  public async syncLatestPrices(): Promise<{ success: boolean; records: number; stations: number; error?: string }> {
    if (this.isSyncing) {
      return { success: false, records: 0, stations: 0, error: "Ya hay una sincronización en curso" };
    }

    this.isSyncing = true;
    const syncLog = await prisma.syncLog.create({
      data: {
        source: "datos.energia.gob.ar (CSV Res. 314/2016)",
        status: "RUNNING",
      },
    });

    console.log(`[Ingestion] Iniciando descarga de dataset oficial desde: ${config.govCsvUrl}`);

    try {
      let stream: Readable;
      try {
        const response = await axios.get(config.govCsvUrl, {
          responseType: "stream",
          timeout: 45000,
        });
        stream = response.data;
      } catch (err: any) {
        console.warn(`[Ingestion] Error al descargar CSV completo (${err.message}). Intentando vía CKAN API...`);
        return await this.syncViaCkanApi(syncLog.id);
      }

      const stationsMap = new Map<string, any>();
      const pricesMap = new Map<string, any>();
      let rowCount = 0;

      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (row: RawGovRecord) => {
            rowCount++;
            const govId = row.idempresa ? parseInt(row.idempresa, 10) : undefined;
            const cuit = row.cuit?.trim() || "";
            const address = row.direccion?.trim() || "Sin dirección";
            const stationKey = govId ? `gov_${govId}` : `cuit_${cuit}_${address}`;

            const brandInfo = this.normalizeBrand(row.empresabandera);
            const productInfo = this.normalizeProduct(row.producto);
            const price = row.precio ? parseFloat(row.precio.replace(",", ".")) : null;

            if (!stationsMap.has(stationKey)) {
              stationsMap.set(stationKey, {
                govId: govId || null,
                cuit: cuit || null,
                name: row.empresa?.trim() || brandInfo.name,
                address: address,
                city: row.localidad?.trim() || "Desconocida",
                province: row.provincia?.trim() || "Desconocida",
                region: row.region?.trim() || null,
                brand: brandInfo.id,
                brandName: brandInfo.name,
                brandId: row.idempresabandera ? parseInt(row.idempresabandera, 10) : null,
                lat: row.latitud ? parseFloat(row.latitud.replace(",", ".")) : null,
                lng: row.longitud ? parseFloat(row.longitud.replace(",", ".")) : null,
              });
            }

            if (productInfo && price && price > 0 && price < 50000) {
              const timeSlot = row.tipohorario?.trim() || "Diurno";
              const priceKey = `${stationKey}_${productInfo.type}_${timeSlot}`;
              
              let effectiveDate = new Date();
              if (row.fecha_vigencia) {
                const parsed = new Date(row.fecha_vigencia);
                if (!isNaN(parsed.getTime())) effectiveDate = parsed;
              }

              const previous = pricesMap.get(priceKey);
              if (!previous || effectiveDate > previous.effectiveDate) pricesMap.set(priceKey, {
                stationKey,
                fuelType: productInfo.type,
                fuelTypeName: productInfo.name,
                originalProduct: row.producto || productInfo.name,
                timeSlot,
                price,
                effectiveDate,
              });
            }
          })
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });

      console.log(`[Ingestion] Parseadas ${rowCount} filas. ${stationsMap.size} estaciones y ${pricesMap.size} precios detectados.`);

      // Guardar en base de datos
      await this.saveToDatabase(stationsMap, pricesMap);

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "SUCCESS",
          recordsProcessed: rowCount,
          stationsCount: stationsMap.size,
          completedAt: new Date(),
        },
      });

      this.lastSyncTime = new Date();
      this.isSyncing = false;
      this.cachedSummary = null; // invalidar cache de resumen

      return {
        success: true,
        records: rowCount,
        stations: stationsMap.size,
      };
    } catch (error: any) {
      console.error("[Ingestion] Error durante la sincronización:", error);
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "FAILED",
          error: error.message || String(error),
          completedAt: new Date(),
        },
      });
      this.isSyncing = false;
      return {
        success: false,
        records: 0,
        stations: 0,
        error: error.message || String(error),
      };
    }
  }

  private async syncViaCkanApi(syncLogId: number): Promise<{ success: boolean; records: number; stations: number; error?: string }> {
    try {
      console.log("[Ingestion] Consultando registros vía Datastore API...");
      const res = await axios.get(`${config.govCkanUrl}&limit=2000`, { timeout: 30000 });
      const records: RawGovRecord[] = res.data?.result?.records || [];

      const stationsMap = new Map<string, any>();
      const pricesMap = new Map<string, any>();

      for (const row of records) {
        const govId = row.idempresa ? parseInt(String(row.idempresa), 10) : undefined;
        const cuit = String(row.cuit || "").trim();
        const address = String(row.direccion || "Sin dirección").trim();
        const stationKey = govId ? `gov_${govId}` : `cuit_${cuit}_${address}`;

        const brandInfo = this.normalizeBrand(row.empresabandera);
        const productInfo = this.normalizeProduct(row.producto);
        const price = typeof row.precio === "number" ? row.precio : (row.precio ? parseFloat(String(row.precio).replace(",", ".")) : null);

        if (!stationsMap.has(stationKey)) {
          stationsMap.set(stationKey, {
            govId: govId || null,
            cuit: cuit || null,
            name: row.empresa || brandInfo.name,
            address: address,
            city: row.localidad || "Desconocida",
            province: row.provincia || "Desconocida",
            region: row.region || null,
            brand: brandInfo.id,
            brandName: brandInfo.name,
            brandId: row.idempresabandera ? parseInt(String(row.idempresabandera), 10) : null,
            lat: row.latitud ? parseFloat(String(row.latitud)) : null,
            lng: row.longitud ? parseFloat(String(row.longitud)) : null,
          });
        }

        if (productInfo && price && price > 0) {
          const timeSlot = row.tipohorario || "Diurno";
          const priceKey = `${stationKey}_${productInfo.type}_${timeSlot}`;
          let effectiveDate = new Date();
          if (row.fecha_vigencia) {
            const parsed = new Date(row.fecha_vigencia);
            if (!isNaN(parsed.getTime())) effectiveDate = parsed;
          }

          const previous = pricesMap.get(priceKey);
          if (!previous || effectiveDate > previous.effectiveDate) pricesMap.set(priceKey, {
            stationKey,
            fuelType: productInfo.type,
            fuelTypeName: productInfo.name,
            originalProduct: row.producto || productInfo.name,
            timeSlot,
            price,
            effectiveDate,
          });
        }
      }

      await this.saveToDatabase(stationsMap, pricesMap);

      await prisma.syncLog.update({
        where: { id: syncLogId },
        data: {
          status: "SUCCESS",
          recordsProcessed: records.length,
          stationsCount: stationsMap.size,
          completedAt: new Date(),
        },
      });

      this.lastSyncTime = new Date();
      this.isSyncing = false;
      this.cachedSummary = null;

      return {
        success: true,
        records: records.length,
        stations: stationsMap.size,
      };
    } catch (err: any) {
      console.error("[Ingestion] Error en sincronización CKAN API:", err);
      this.isSyncing = false;
      return { success: false, records: 0, stations: 0, error: err.message };
    }
  }

  private async saveToDatabase(stationsMap: Map<string, any>, pricesMap: Map<string, any>): Promise<void> {
    console.log("[Ingestion] Guardando estaciones y precios en base de datos...");
    
    // Batch processing
    const stationEntries = Array.from(stationsMap.entries());
    const stationIdMap = new Map<string, string>();

    // Guardar estaciones en lotes
    const BATCH_SIZE = 100;
    for (let i = 0; i < stationEntries.length; i += BATCH_SIZE) {
      const batch = stationEntries.slice(i, i + BATCH_SIZE);
      
      await prisma.$transaction(
        batch.map(([key, data]) => {
          if (data.govId) {
            return prisma.station.upsert({
              where: { govId: data.govId },
              create: data,
              update: data,
            });
          } else {
            return prisma.station.create({
              data,
            });
          }
        })
      ).then((results) => {
        results.forEach((st, idx) => {
          const [key] = batch[idx];
          stationIdMap.set(key, st.id);
        });
      });
    }

    console.log(`[Ingestion] Guardadas ${stationIdMap.size} estaciones. Guardando precios...`);

    // Guardar precios en lotes
    const priceEntries = Array.from(pricesMap.values());
    for (let i = 0; i < priceEntries.length; i += BATCH_SIZE) {
      const batch = priceEntries.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map((p) => {
        const stationId = stationIdMap.get(p.stationKey);
        if (!stationId) return null;

        return prisma.priceRecord.upsert({
          where: {
            stationId_fuelType_timeSlot_effectiveDate: {
              stationId,
              fuelType: p.fuelType,
              timeSlot: p.timeSlot,
              effectiveDate: p.effectiveDate,
            },
          },
          create: {
            stationId,
            fuelType: p.fuelType,
            fuelTypeName: p.fuelTypeName,
            originalProduct: p.originalProduct,
            timeSlot: p.timeSlot,
            price: p.price,
            effectiveDate: p.effectiveDate,
          },
          update: { price: p.price, fuelTypeName: p.fuelTypeName, originalProduct: p.originalProduct },
        });
      }).filter(Boolean);

      if (promises.length > 0) {
        await prisma.$transaction(promises as any);
      }
    }

    console.log("[Ingestion] Guardado completo.");
  }

  public getLastSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

export const govIngestionService = new GovIngestionService();
