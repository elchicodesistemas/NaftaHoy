import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../models/schema.js";
import { env } from "./env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Todas las columnas de fecha son timestamptz (se guardan en UTC); esto solo
  // afecta cómo Postgres muestra/interpreta fechas sin offset explícito en la sesión.
  options: "-c TimeZone=America/Argentina/Buenos_Aires",
});

export const db = drizzle(pool, { schema });
