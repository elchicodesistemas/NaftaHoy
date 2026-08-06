import { Hono } from "hono";
import { verificarCredenciales } from "../lib/integradores.js";
import { signIntegradorToken } from "../lib/jwt.js";

const auth = new Hono();

const EXPIRES_IN_SECONDS = 60 * 60; // 1h — mantener sincronizado con JWT_EXPIRES_IN en .env

auth.post("/token", async (c) => {
  const body = await c.req.json().catch(() => null);
  const usuario = body?.usuario;
  const secret = body?.secret;

  if (typeof usuario !== "string" || typeof secret !== "string") {
    return c.json({ error: "usuario y secret son requeridos" }, 400);
  }

  const integrador = await verificarCredenciales(usuario, secret);
  if (!integrador) {
    return c.json({ error: "Credenciales inválidas" }, 401);
  }

  const accessToken = signIntegradorToken({
    sub: integrador.usuario,
    empresa: integrador.empresa,
  });

  return c.json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: EXPIRES_IN_SECONDS,
  });
});

export default auth;
