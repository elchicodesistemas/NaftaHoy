import axios from "axios";
import csv from "csv-parser";
import { spawn } from "child_process";
import { createReadStream, createWriteStream } from "fs";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { basename, join } from "path";
import { pipeline } from "stream/promises";
import { prisma } from "../config/prisma";
import { config } from "../config";

type Res1104Record = Record<string, string | undefined>;

export interface NormalizedBrand { id: string; name: string; }
export interface NormalizedProduct { type: string; name: string; }

interface StationInput {
  govId: number | null;
  cuit: string | null;
  name: string;
  address: string;
  city: string;
  province: string;
  region?: string | null;
  brand: string;
  brandName: string;
  brandId?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface PriceInput {
  stationKey: string;
  fuelType: string;
  fuelTypeName: string;
  originalProduct: string;
  timeSlot: string;
  price: number;
  effectiveDate: Date;
}

export class GovIngestionService {
  private isSyncing = false;
  private lastSyncTime: Date | null = null;

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
    return { id: "blanca", name: rawBrand.trim() };
  }

  public normalizeProduct(rawProduct: string | undefined): NormalizedProduct | null {
    if (!rawProduct) return null;
    const product = rawProduct.toLowerCase().trim();
    if (product.includes("súper") || product.includes("super") || (product.includes("nafta") && product.includes("92"))) return { type: "SUPER", name: "Nafta Súper" };
    if (product.includes("premium") || product.includes("infinia") || product.includes("v-power") || (product.includes("nafta") && product.includes("95"))) return { type: "PREMIUM", name: "Nafta Premium" };
    if (product.includes("gas oil grado 2") || product.includes("gasoil grado 2") || product.includes("diesel común")) return { type: "DIESEL", name: "Diesel" };
    if (product.includes("gas oil grado 3") || product.includes("gasoil grado 3") || product.includes("diesel premium")) return { type: "DIESEL_PREMIUM", name: "Diesel Premium" };
    if (product.includes("gnc") || product.includes("gas natural")) return { type: "GNC", name: "GNC" };
    return null;
  }

  public isSyncInProgress() { return this.isSyncing; }

  public async syncLatestPrices(input?: { archivePath?: string; format?: "zip" | "accdb" }): Promise<{ success: boolean; records: number; stations: number; error?: string }> {
    if (this.isSyncing) return { success: false, records: 0, stations: 0, error: "Ya hay una sincronización en curso" };

    this.isSyncing = true;
    const syncLog = await prisma.syncLog.create({ data: { source: "res1104.se.gob.ar (RES 1104/2004)", status: "RUNNING" } });
    let workDir: string | undefined;

    try {
      workDir = await mkdtemp(join(tmpdir(), "naftahoy-res1104-"));
      const archivePath = input?.archivePath || join(workDir, "precios-eess.zip");
      const databasePath = join(workDir, "precios-eess.accdb");

      if (input?.archivePath) {
        console.log(`[Ingestion] Procesando carga manual RES 1104/2004: ${basename(input.archivePath)}`);
      } else {
        console.log(`[Ingestion] Descargando archivo oficial RES 1104/2004 desde: ${config.res1104ZipUrl}`);
        await this.downloadArchive(archivePath);
      }
      const accessDatabase = input?.format === "accdb" ? archivePath : await this.extractAccessDatabase(archivePath, databasePath);

      const stations = new Map<string, StationInput>();
      const prices = new Map<string, PriceInput>();
      const records = await this.readAccessRows(accessDatabase, (row) => this.collectRow(row, stations, prices));
      console.log(`[Ingestion] Leídas ${records} filas mensuales. ${stations.size} estaciones y ${prices.size} precios válidos detectados.`);

      await this.saveToDatabase(stations, prices);
      await prisma.syncLog.update({ where: { id: syncLog.id }, data: { status: "SUCCESS", recordsProcessed: records, stationsCount: stations.size, completedAt: new Date() } });
      this.lastSyncTime = new Date();
      return { success: true, records, stations: stations.size };
    } catch (error: any) {
      const message = error.message || String(error);
      console.error("[Ingestion] Error durante la sincronización RES 1104/2004:", message);
      await prisma.syncLog.update({ where: { id: syncLog.id }, data: { status: "FAILED", error: message, completedAt: new Date() } });
      return { success: false, records: 0, stations: 0, error: message };
    } finally {
      this.isSyncing = false;
      if (workDir) await rm(workDir, { recursive: true, force: true });
    }
  }

  private async downloadArchive(destination: string) {
    const response = await axios.get(config.res1104ZipUrl, { responseType: "stream", timeout: 120_000, maxRedirects: 0, validateStatus: (status) => status === 200 });
    await pipeline(response.data, createWriteStream(destination));
    const signature = await readFile(destination, { encoding: null }).then((buffer) => buffer.subarray(0, 4).toString("hex"));
    if (signature !== "504b0304" && signature !== "504b0506" && signature !== "504b0708") {
      throw new Error("La descarga RES 1104/2004 no es un ZIP válido. Se rechazó para evitar importar una página de error o autenticación.");
    }
  }

  private async extractAccessDatabase(archivePath: string, destination: string): Promise<string> {
    const entries = await this.runCommand("unzip", ["-Z1", archivePath]);
    const entry = entries.split(/\r?\n/).find((name) => name.toLowerCase().endsWith(".accdb"));
    if (!entry) throw new Error("El ZIP de RES 1104/2004 no contiene un archivo .accdb.");
    await this.streamCommandToFile("unzip", ["-p", archivePath, entry], destination);
    return destination;
  }

  private async readAccessRows(databasePath: string, onRow: (row: Res1104Record) => void): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const process = spawn("mdb-export", [databasePath, config.res1104TableName], { stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      let records = 0;
      process.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
      const parser = csv();
      parser.on("data", (row: Res1104Record) => { records += 1; onRow(row); });
      parser.on("error", reject);
      process.on("error", reject);
      process.on("close", (code) => code === 0 ? resolve(records) : reject(new Error(`mdb-export finalizó con código ${code}: ${stderr.trim()}`)));
      process.stdout.pipe(parser);
    });
  }

  private collectRow(row: Res1104Record, stations: Map<string, StationInput>, prices: Map<string, PriceInput>) {
    if (this.clean(row["Canal de Comercialización"]).toLowerCase() !== "al público") return;
    const govId = this.parseInteger(row["Nro Inscripción"]);
    const cuit = this.clean(row.CUIT);
    const address = this.clean(row["Dirección"]) || "Sin dirección";
    const stationKey = govId ? `gov_${govId}` : `cuit_${cuit}_${address}`;
    const brand = this.normalizeBrand(row.Bandera);
    const period = this.parsePeriod(row["Período"]);
    const product = this.normalizeProduct(row.Producto);
    const price = this.parsePrice(row["Precio surtidor"]) || this.parsePrice(row["Precio con impuestos"]);

    if (!stations.has(stationKey)) {
      stations.set(stationKey, {
        govId: govId || null,
        cuit: cuit || null,
        name: this.clean(row.Operador) || brand.name,
        address,
        city: this.clean(row.Localidad) || "Desconocida",
        province: this.clean(row.Provincia) || "Desconocida",
        brand: brand.id,
        brandName: brand.name,
      });
    }
    if (!period || !product || !price || price <= 0 || price > 50_000) return;
    const priceKey = `${stationKey}_${product.type}_Mensual_${period.toISOString()}`;
    prices.set(priceKey, { stationKey, fuelType: product.type, fuelTypeName: product.name, originalProduct: this.clean(row.Producto) || product.name, timeSlot: "Mensual", price, effectiveDate: period });
  }

  private async saveToDatabase(stations: Map<string, StationInput>, prices: Map<string, PriceInput>) {
    const stationIdMap = new Map<string, string>();
    const stationEntries = [...stations.entries()];
    const batchSize = 100;
    for (let index = 0; index < stationEntries.length; index += batchSize) {
      const batch = stationEntries.slice(index, index + batchSize);
      const results = await prisma.$transaction(batch.map(([, data]) => {
        const update = { ...data, lat: undefined, lng: undefined, region: undefined, brandId: undefined };
        return data.govId ? prisma.station.upsert({ where: { govId: data.govId }, create: data, update }) : prisma.station.create({ data });
      }));
      results.forEach((station, itemIndex) => stationIdMap.set(batch[itemIndex][0], station.id));
    }

    const priceEntries = [...prices.values()];
    for (let index = 0; index < priceEntries.length; index += batchSize) {
      const batch = priceEntries.slice(index, index + batchSize);
      const commands = batch.flatMap((price) => {
        const stationId = stationIdMap.get(price.stationKey);
        return stationId ? [prisma.priceRecord.upsert({
          where: { stationId_fuelType_timeSlot_effectiveDate: { stationId, fuelType: price.fuelType, timeSlot: price.timeSlot, effectiveDate: price.effectiveDate } },
          create: { ...price, stationId },
          update: { price: price.price, fuelTypeName: price.fuelTypeName, originalProduct: price.originalProduct },
        })] : [];
      });
      if (commands.length) await prisma.$transaction(commands);
    }
  }

  private clean(value: string | undefined) { return value?.trim() || ""; }
  private parseInteger(value: string | undefined) { const parsed = Number.parseInt(this.clean(value), 10); return Number.isInteger(parsed) ? parsed : null; }
  private parsePrice(value: string | undefined) {
    const raw = this.clean(value).replace(/\s/g, "");
    if (!raw) return null;
    const comma = raw.lastIndexOf(",");
    const dot = raw.lastIndexOf(".");
    const normalized = comma > dot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed >= 50 ? parsed : null;
  }
  private parsePeriod(value: string | undefined) { const match = this.clean(value).match(/^(\d{4})\/(\d{1,2})$/); return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)) : null; }
  private async runCommand(command: string, args: string[]) {
    return new Promise<string>((resolve, reject) => {
      const process = spawn(command, args);
      let stdout = "";
      let stderr = "";
      process.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
      process.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
      process.on("error", reject);
      process.on("close", (code) => code === 0
        ? resolve(stdout)
        : reject(new Error(`${command} finalizó con código ${code}: ${stderr.trim()}`)));
    });
  }

  private async streamCommandToFile(command: string, args: string[], destination: string) {
    const process = spawn(command, args);
    let stderr = "";
    process.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    await pipeline(process.stdout, createWriteStream(destination));
    const code = await new Promise<number | null>((resolve) => process.on("close", resolve));
    if (code !== 0) throw new Error(`${command} finalizó con código ${code}: ${stderr.trim()}`);
  }

  public getLastSyncStatus() { return { isSyncing: this.isSyncing, lastSyncTime: this.lastSyncTime }; }
}

export const govIngestionService = new GovIngestionService();
