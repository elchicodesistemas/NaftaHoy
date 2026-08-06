import type { MiddlewareHandler } from "hono";

/*
  Auth simple por API key compartida (header x-api-key contra process.env.API_KEY).
  Alcanza para esta etapa (un solo consumidor: el propio frontend). Si en algún
  momento hay múltiples clientes con permisos distintos, esto pasa a ser una
  tabla de keys en la base, no una sola variable de entorno.
*/
export const apiKeyAuth: MiddlewareHandler = async (c, next) => {
  const expected = process.env.API_KEY;
  if (!expected) {
    return c.json({ error: "API_KEY no configurada en el servidor" }, 500);
  }
  if (c.req.header("x-api-key") !== expected) {
    return c.json({ error: "API key inválida o faltante" }, 401);
  }
  await next();
};
