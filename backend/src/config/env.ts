import "dotenv/config";
import { z } from "zod";

/*
  Falla rápido al arrancar si falta o está mal una env var, en vez de que el
  error aparezca recién cuando algo la usa (ej: JWT_SECRET undefined llegando
  silencioso hasta jsonwebtoken). Mismo criterio que ya usaban config/db.ts y
  lib/jwt.ts con sus checks manuales — esto los reemplaza y centraliza.
*/
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL en backend/.env"),
  JWT_SECRET: z.string().min(1, "Falta JWT_SECRET en backend/.env"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  PORT: z.coerce.number().int().positive().default(3001),
  // Separados por coma, ej: "http://localhost:3000,https://naftahoy.com"
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Variables de entorno inválidas en backend/.env:\n${detalle}`,
  );
}

export const env = parsed.data;
