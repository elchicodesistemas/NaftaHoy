import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

/*
  En memoria del proceso — alcanza mientras haya una sola instancia del server
  corriendo (PM2 sin cluster mode). Si en algún momento se escala a varias
  instancias, esto necesita un store compartido (Redis, que igual está
  planeado para el cache de precios en vivo, ver docs/arquitectura.md).
*/
const byIp = (c: Context) => getConnInfo(c).remote.address ?? "anonimo";

/*
  Keyed solo por IP: el "sub" de un JWT no verificado todavía es un dato que
  cualquiera puede falsificar, así que no sirve como clave de rate limit acá
  (bearerAuth corre después de este middleware). Con un solo integrador activo
  un límite por-integrador tampoco aporta nada todavía — si en algún momento
  hay varios, sumar un segundo limiter DESPUÉS de bearerAuth, keyed por
  c.get("integrador").sub.
*/
export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  keyGenerator: byIp,
});

/*
  Más estricto que el general: esta ruta compara secretos, así que hay que
  frenar fuerza bruta contra clientId/secret. Por IP porque acá tampoco hay
  todavía ninguna identidad verificada.
*/
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  keyGenerator: byIp,
});
