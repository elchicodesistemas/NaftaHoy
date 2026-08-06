import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { integradores } from "../models/integradores.js";

export interface Integrador {
  usuario: string;
  empresa: string;
}

/*
  Mismo mensaje de error para "no existe", "deshabilitado", "empresa no
  coincide" e "invalido" — no hay que darle a quien intenta autenticarse
  pistas sobre cuál de los cuatro pasó.

  empresa se exige en el login (no solo se lee de la fila) porque "usuario"
  es único a nivel global pero varios usuarios pueden pertenecer a la misma
  empresa — pedirla acá obliga a que quien llama declare explícitamente para
  qué empresa está pidiendo el token, en vez de asumirla en silencio desde
  la fila. Comparación case-insensitive: "empresa" es texto libre cargado a
  mano (seedIntegrador.ts), no hay normalización de mayúsculas todavía.
*/
export async function verificarCredenciales(
  usuario: string,
  empresa: string,
  secret: string,
): Promise<Integrador | null> {
  const [fila] = await db
    .select()
    .from(integradores)
    .where(eq(integradores.usuario, usuario))
    .limit(1);

  if (!fila?.habilitado) return null;

  if (fila.empresa.toLowerCase() !== empresa.toLowerCase()) return null;

  const secretOk = await bcrypt.compare(secret, fila.secretHash);
  if (!secretOk) return null;

  return { usuario: fila.usuario, empresa: fila.empresa };
}
