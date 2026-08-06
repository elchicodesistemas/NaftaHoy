import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { verificarCredenciales } from "../lib/integradores.js";
import { signIntegradorToken } from "../lib/jwt.js";
import { tokenBodySchema } from "../schemas/auth.schema.js";

const auth = new Hono();

const EXPIRES_IN_SECONDS = 60 * 60; // 1h — mantener sincronizado con JWT_EXPIRES_IN en .env

auth.post("/token", zValidator("json", tokenBodySchema), async (c) => {
  const { usuario, empresa, secret } = c.req.valid("json");

  const integrador = await verificarCredenciales(usuario, empresa, secret);
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
