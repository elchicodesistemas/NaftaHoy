import { getConnInfo } from "@hono/node-server/conninfo";
import { rateLimiter } from "hono-rate-limiter";

/*
  En memoria del proceso — alcanza mientras haya una sola instancia del server
  corriendo (PM2 sin cluster mode). Si en algún momento se escala a varias
  instancias, esto necesita un store compartido (Redis, que igual está
  planeado para el cache de precios en vivo, ver docs/arquitectura.md).

  Se limita por API key primero (identifica al cliente real) y cae a la IP
  si por algún motivo no hay key (no debería pasar: apiKeyAuth corre después,
  pero así igual hay un piso de protección contra flood sin key válida).
*/
export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  keyGenerator: (c) =>
    c.req.header("x-api-key") ?? getConnInfo(c).remote.address ?? "anonimo",
});
