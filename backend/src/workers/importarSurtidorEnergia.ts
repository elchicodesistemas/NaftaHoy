import "dotenv/config";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  estaciones,
  ingestaRuns,
  petroleras,
  preciosActuales,
  preciosHistorico,
} from "../models/schema.js";

/*
  Importa el dataset "Precios en Surtidor" (Resolución 314/2016, Secretaría de
  Energía — docs/fuentes-datos.md fuente #2/#4). Cada fila del CSV es un
  producto+franja horaria de una estación puntual; "indice_tiempo" varía por fila
  porque cada estación reporta a su propio ritmo, así que el archivo funciona como
  "último precio conocido por estación" más que como serie histórica completa.

  Uso:
    npx tsx src/workers/importarSurtidorEnergia.ts <ruta-al-csv> [--dry-run]

  --dry-run parsea y mapea el CSV pero no toca la base — sirve para validar el
  archivo antes de tener una conexión real a Postgres.
*/

const FUENTE = "energia-datos-abiertos";
const BATCH_SIZE = 500;

// idempresabandera del CSV -> nuestra petrolera canónica. Cubre las 11 marcas
// reales que aparecen en el dataset (relevadas con Import-Csv sobre el archivo real).
const MARCAS: Record<string, { nombre: string; slug: string }> = {
  "-1": { nombre: "Sin Marca", slug: "sin-marca" },
  "1": { nombre: "Bandera Blanca", slug: "blanca" },
  "2": { nombre: "YPF", slug: "ypf" },
  "4": { nombre: "Shell", slug: "shell" },
  "6": { nombre: "DAPSA", slug: "dapsa" },
  "8": { nombre: "Refinor", slug: "refinor" },
  "24": { nombre: "Oil Combustibles", slug: "oil-combustibles" },
  "26": { nombre: "Axion Energy", slug: "axion" },
  "28": { nombre: "Puma Energy", slug: "puma" },
  "29": { nombre: "Gulf", slug: "gulf" },
  "30": { nombre: "Voy", slug: "voy" },
};

// producto del CSV -> tipo_combustible canónico (formato unificado de docs/fuentes-datos.md)
const PRODUCTOS: Record<string, string> = {
  "Nafta (súper) entre 92 y 95 Ron": "nafta_super",
  "Nafta (premium) de más de 95 Ron": "nafta_premium",
  "Gas Oil Grado 2": "diesel_comun",
  "Gas Oil Grado 3": "diesel_premium",
  GNC: "gnc",
};

interface CsvRow {
  idempresa: string;
  empresa: string;
  direccion: string;
  localidad: string;
  provincia: string;
  producto: string;
  tipohorario: string;
  precio: string;
  fecha_vigencia: string;
  idempresabandera: string;
  latitud: string;
  longitud: string;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

function parseFechaVigencia(raw: string): Date {
  // El dataset no trae timezone; asumimos hora local Argentina (UTC-3, sin horario de verano).
  return new Date(`${raw.replace(" ", "T")}-03:00`);
}

function leerYMapear(csvPath: string) {
  const raw = readFileSync(csvPath, "utf-8");
  const rows: CsvRow[] = parse(raw, { columns: true, skip_empty_lines: true });

  // Solo Diurno: nuestro schema guarda un precio por estación+combustible, no por
  // franja horaria. Nocturno queda documentado acá si algún día se agrega esa dimensión.
  const diurnas = rows.filter(
    (r) => r.tipohorario === "Diurno" && r.latitud && r.longitud,
  );

  const petrolerasPorSlug = new Map<string, { nombre: string; slug: string }>();
  for (const r of diurnas) {
    const marca = MARCAS[r.idempresabandera];
    if (marca) petrolerasPorSlug.set(marca.slug, marca);
  }

  const estacionPorExternalId = new Map<string, CsvRow>();
  for (const r of diurnas) {
    if (!estacionPorExternalId.has(r.idempresa))
      estacionPorExternalId.set(r.idempresa, r);
  }

  const estacionValues = [...estacionPorExternalId.entries()]
    .map(([externalId, r]) => {
      const marca = MARCAS[r.idempresabandera];
      if (!marca) return null;
      return {
        externalId,
        slugPetrolera: marca.slug,
        nombre: r.empresa,
        direccion: r.direccion,
        localidad: r.localidad,
        provincia: r.provincia,
        latitud: r.latitud,
        longitud: r.longitud,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const precioRows = diurnas
    .map((r) => {
      const tipoCombustible = PRODUCTOS[r.producto];
      const marca = MARCAS[r.idempresabandera];
      if (!tipoCombustible || !marca) return null;
      return {
        externalIdEstacion: r.idempresa,
        tipoCombustible,
        precio: r.precio,
        fechaVigencia: parseFechaVigencia(r.fecha_vigencia),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return {
    totalFilas: rows.length,
    filasOmitidasSinCoordenadas: rows.filter(
      (r) => r.tipohorario === "Diurno" && (!r.latitud || !r.longitud),
    ).length,
    petrolerasPorSlug,
    estacionValues,
    precioRows,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));
  if (!csvPath) {
    throw new Error(
      "Uso: npx tsx src/workers/importarSurtidorEnergia.ts <ruta-al-csv> [--dry-run]",
    );
  }

  const {
    totalFilas,
    filasOmitidasSinCoordenadas,
    petrolerasPorSlug,
    estacionValues,
    precioRows,
  } = leerYMapear(csvPath);

  console.log(`Filas totales en el CSV: ${totalFilas}`);
  console.log(
    `Filas Diurno sin coordenadas (omitidas): ${filasOmitidasSinCoordenadas}`,
  );
  console.log(`Petroleras detectadas: ${petrolerasPorSlug.size}`);
  console.log(`Estaciones únicas a cargar: ${estacionValues.length}`);
  console.log(`Precios a cargar: ${precioRows.length}`);

  if (dryRun) {
    console.log("--dry-run: no se escribió nada en la base.");
    console.log("Muestra de estación:", estacionValues[0]);
    console.log("Muestra de precio:", precioRows[0]);
    return;
  }

  const [run] = await db
    .insert(ingestaRuns)
    .values({ fuente: FUENTE, estado: "en_progreso" })
    .returning({ id: ingestaRuns.id });

  try {
    // 1) upsert petroleras, guardamos slug -> id para resolver las FKs de después
    const petroleraIdPorSlug = new Map<string, string>();
    for (const marca of petrolerasPorSlug.values()) {
      const [row] = await db
        .insert(petroleras)
        .values({ nombre: marca.nombre, slug: marca.slug })
        .onConflictDoUpdate({
          target: petroleras.slug,
          set: { nombre: marca.nombre },
        })
        .returning({ id: petroleras.id, slug: petroleras.slug });
      petroleraIdPorSlug.set(row.slug, row.id);
    }

    // 2) upsert estaciones, guardamos external_id -> id para resolver las FKs de los precios
    const estacionIdPorExternalId = new Map<string, string>();
    for (const batch of chunk(estacionValues, BATCH_SIZE)) {
      const values = batch.map((e) => ({
        petroleraId: petroleraIdPorSlug.get(e.slugPetrolera)!,
        nombre: e.nombre,
        direccion: e.direccion,
        localidad: e.localidad,
        provincia: e.provincia,
        latitud: e.latitud,
        longitud: e.longitud,
        fuente: FUENTE,
        externalId: e.externalId,
      }));
      const inserted = await db
        .insert(estaciones)
        .values(values)
        .onConflictDoUpdate({
          target: [estaciones.fuente, estaciones.externalId],
          set: {
            petroleraId: sql`excluded.petrolera_id`,
            nombre: sql`excluded.nombre`,
            direccion: sql`excluded.direccion`,
            localidad: sql`excluded.localidad`,
            provincia: sql`excluded.provincia`,
            latitud: sql`excluded.latitud`,
            longitud: sql`excluded.longitud`,
            updatedAt: new Date(),
          },
        })
        .returning({ id: estaciones.id, externalId: estaciones.externalId });
      for (const row of inserted)
        estacionIdPorExternalId.set(row.externalId, row.id);
    }
    console.log(`Estaciones cargadas: ${estacionIdPorExternalId.size}`);

    // 3) precios actuales (snapshot, upsert) + histórico (append-only, mismo dato)
    let preciosCargados = 0;
    for (const batch of chunk(precioRows, BATCH_SIZE)) {
      const values = batch
        .map((p) => {
          const estacionId = estacionIdPorExternalId.get(p.externalIdEstacion);
          if (!estacionId) return null;
          return {
            estacionId,
            tipoCombustible: p.tipoCombustible,
            precio: p.precio,
            fechaVigencia: p.fechaVigencia,
            fuente: FUENTE,
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      await db
        .insert(preciosActuales)
        .values(values)
        .onConflictDoUpdate({
          target: [preciosActuales.estacionId, preciosActuales.tipoCombustible],
          set: {
            precio: sql`excluded.precio`,
            fechaVigencia: sql`excluded.fecha_vigencia`,
            fechaCapturado: new Date(),
          },
        });
      await db.insert(preciosHistorico).values(values).onConflictDoNothing();
      preciosCargados += values.length;
    }
    console.log(`Precios cargados: ${preciosCargados}`);

    await db
      .update(ingestaRuns)
      .set({
        estado: "ok",
        registrosProcesados: preciosCargados,
        finalizadoEn: new Date(),
      })
      .where(eq(ingestaRuns.id, run.id));
  } catch (err) {
    await db
      .update(ingestaRuns)
      .set({
        estado: "error",
        errorMensaje: err instanceof Error ? err.message : String(err),
        finalizadoEn: new Date(),
      })
      .where(eq(ingestaRuns.id, run.id));
    throw err;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
