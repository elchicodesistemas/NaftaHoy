import type { MiddlewareHandler } from "hono";
import { verifyIntegradorToken } from "../lib/jwt.js";

/*
  Reemplaza a la vieja API key estatica (apiKey.ts, dado de baja). Ver
  backend/src/routes/auth.ts para como se consigue el token.
*/
export const bearerAuth: MiddlewareHandler<{
  Variables: { integrador: { sub: string; empresa: string } };
}> = async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return c.json({ error: "Falta el token de autenticación" }, 401);
  }

  try {
    const payload = verifyIntegradorToken(token);
    c.set("integrador", payload);
  } catch {
    return c.json({ error: "Token inválido o vencido" }, 401);
  }

  await next();
};
