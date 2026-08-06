import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { apiKeyAuth } from "./middleware/apiKey.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import precios from "./routes/precios.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

// Todo lo que cuelga de /api requiere API key y tiene rate limit.
// El orden importa: primero se limita por volumen (protege incluso sin key
// válida), recién después se valida la key.
app.use("/api/*", apiRateLimit, apiKeyAuth);
app.route("/api/precios", precios);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}`);
});
