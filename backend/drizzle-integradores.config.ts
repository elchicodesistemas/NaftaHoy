import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta DATABASE_URL en backend/.env (copiá .env.example y completá los datos de tu Postgres)",
  );
}

/*
  Config separado de drizzle.config.ts a propósito: schema.ts tiene 8 tablas sin
  migrar todavía (decisión pendiente). Este config solo conoce integradores.ts,
  así que generate/migrate acá nunca puede tocar esas otras tablas por error.
*/
export default defineConfig({
  schema: "./src/models/integradores.ts",
  out: "./drizzle-integradores",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    schema: "public",
  },
  verbose: true,
  strict: true,
});
