import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { integradores } from "../models/integradores.js";

/*
  Sin endpoint de auto-registro en esta primera instancia: las filas se crean
  a mano con este script (mismo espíritu que LS_Jabones/server/src/db/seedAdmin.ts).

  Uso:
    npm run seed:integrador -- <usuario> <empresa> <secret>

  Si el usuario ya existe, actualiza el secreto y lo deja habilitado (útil
  para rotar un secreto sin borrar el registro).
*/
const [usuario, empresa, secret] = process.argv.slice(2);

if (!usuario || !empresa || !secret) {
  console.error("Uso: npm run seed:integrador -- <usuario> <empresa> <secret>");
  process.exit(1);
}

const secretHash = await bcrypt.hash(secret, 10);

const [existente] = await db
  .select()
  .from(integradores)
  .where(eq(integradores.usuario, usuario))
  .limit(1);

if (existente) {
  await db
    .update(integradores)
    .set({ empresa, secretHash, habilitado: true })
    .where(eq(integradores.usuario, usuario));
  console.log(`Integrador "${usuario}" actualizado y habilitado.`);
} else {
  await db
    .insert(integradores)
    .values({ usuario, empresa, secretHash, habilitado: true });
  console.log(`Integrador "${usuario}" creado y habilitado.`);
}

process.exit(0);
