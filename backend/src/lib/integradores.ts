import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { integradores } from "../models/integradores.js";

export interface Integrador {
  usuario: string;
  empresa: string;
}

/*
  Mismo mensaje de error para "no existe", "deshabilitado" e "invalido" —
  no hay que darle a quien intenta autenticarse pistas sobre si un usuario existe.
*/
export async function verificarCredenciales(
  usuario: string,
  secret: string,
): Promise<Integrador | null> {
  const [fila] = await db
    .select()
    .from(integradores)
    .where(eq(integradores.usuario, usuario))
    .limit(1);

  if (!fila?.habilitado) return null;

  const secretOk = await bcrypt.compare(secret, fila.secretHash);
  if (!secretOk) return null;

  return { usuario: fila.usuario, empresa: fila.empresa };
}
