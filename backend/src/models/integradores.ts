import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/*
  Registro de integradores externos que consumen la API (/auth/token + /api/*).
  A propósito NO vive en schema.ts: ese archivo tiene 8 tablas todavía sin migrar
  (decisión pendiente, ver CLAUDE.md), y si esta tabla se agregara ahí, la primera
  migración las crearía todas de rebote. Se migra sola con
  drizzle-integradores.config.ts.

  habilitado arranca en false: una fila nueva no puede autenticarse hasta que se
  active a mano (ver backend/src/scripts/seedIntegrador.ts). No hay endpoint de
  auto-registro en esta primera instancia.
*/
export const integradores = pgTable("integradores", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuario: text("usuario").notNull().unique(),
  empresa: text("empresa").notNull(),
  secretHash: text("secret_hash").notNull(),
  habilitado: boolean("habilitado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
