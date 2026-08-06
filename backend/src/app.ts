import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env.js";
import { bearerAuth } from "./middleware/bearerAuth.js";
import { apiRateLimit, authRateLimit } from "./middleware/rateLimit.js";
import auth from "./routes/auth.js";
import precios from "./routes/precios.js";

export const app = new Hono<{
  Variables: { integrador: { sub: string; empresa: string } };
}>();

app.use(logger());
app.use(secureHeaders());
app.use(compress());
app.use(cors({ origin: env.CORS_ORIGIN }));

app.get("/health", (c) => c.json({ ok: true }));

// /auth queda fuera de /api a propósito: si estuviera adentro haría falta un
// Bearer token para poder pedir un Bearer token. Solo tiene su propio rate
// limit (más estricto, protege contra fuerza bruta de credenciales).
app.use("/auth/*", authRateLimit);
app.route("/auth", auth);

// Todo lo que cuelga de /api requiere Bearer token y tiene rate limit.
// El orden importa: primero se limita por volumen (protege incluso sin token
// válido), recién después se valida el token.
app.use("/api/*", apiRateLimit, bearerAuth);
app.route("/api/precios", precios);

app.notFound((c) => c.json({ error: "Recurso no encontrado" }, 404));

// Nunca exponer al cliente el mensaje real de un error interno (puede traer
// detalle de Postgres, stack traces, etc.) — se loguea completo del lado
// servidor y se devuelve uno genérico. HTTPException es la única excepción:
// esos ya vienen con un status/mensaje pensado para mostrarse.
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: "Error interno del servidor" }, 500);
});
