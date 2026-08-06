import { serve } from "@hono/node-server";
import { Hono } from "hono";
import precios from "./routes/precios.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/api/precios", precios);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}`);
});
