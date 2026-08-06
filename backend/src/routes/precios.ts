import { and, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../config/db.js";
import { vPreciosSurtidor } from "../models/staging.js";

const precios = new Hono();

precios.get("/", async (c) => {
  const { producto, empresa, provincia, region } = c.req.query();

  const limitParam = Number(c.req.query("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 500)
      : 50;

  const offsetParam = Number(c.req.query("offset"));
  const offset =
    Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  const filters = [];
  if (producto) filters.push(ilike(vPreciosSurtidor.producto, `%${producto}%`));
  if (empresa) filters.push(ilike(vPreciosSurtidor.empresa, `%${empresa}%`));
  if (provincia) filters.push(eq(vPreciosSurtidor.provincia, provincia));
  if (region) filters.push(eq(vPreciosSurtidor.regionNormalizada, region));

  const rows = await db
    .select()
    .from(vPreciosSurtidor)
    .where(filters.length ? and(...filters) : undefined)
    .limit(limit)
    .offset(offset);

  return c.json({ limit, offset, count: rows.length, data: rows });
});

export default precios;
