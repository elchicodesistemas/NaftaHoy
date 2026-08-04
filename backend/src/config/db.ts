import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../models/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta DATABASE_URL en backend/.env (copiá .env.example y completá los datos de tu Postgres)",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Todas las columnas de fecha son timestamptz (se guardan en UTC); esto solo
  // afecta cómo Postgres muestra/interpreta fechas sin offset explícito en la sesión.
  options: "-c TimeZone=America/Argentina/Buenos_Aires",
});

export const db = drizzle(pool, { schema });
