import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { bearerAuth } from "./middleware/bearerAuth.js";
import { apiRateLimit, authRateLimit } from "./middleware/rateLimit.js";
import auth from "./routes/auth.js";
import precios from "./routes/precios.js";

const app = new Hono<{
  Variables: { integrador: { sub: string; empresa: string } };
}>();

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

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}`);
});
