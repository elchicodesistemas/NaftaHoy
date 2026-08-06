import { zValidator } from "@hono/zod-validator";
import { and, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../config/db.js";
import { vPreciosSurtidor } from "../models/staging.js";
import {
  FILTROS_PRECIOS,
  preciosQuerySchema,
} from "../schemas/precios.schema.js";

const precios = new Hono();

precios.get("/", zValidator("query", preciosQuerySchema), async (c) => {
  const { producto, empresa, provincia, region, limit, offset } =
    c.req.valid("query");

  const filters = [];
  if (producto) filters.push(ilike(FILTROS_PRECIOS.producto, `%${producto}%`));
  if (empresa) filters.push(ilike(FILTROS_PRECIOS.empresa, `%${empresa}%`));
  if (provincia) filters.push(eq(FILTROS_PRECIOS.provincia, provincia));
  if (region) filters.push(eq(FILTROS_PRECIOS.region, region));

  const rows = await db
    .select()
    .from(vPreciosSurtidor)
    .where(filters.length ? and(...filters) : undefined)
    .limit(limit)
    .offset(offset);

  return c.json({ limit, offset, count: rows.length, data: rows });
});

export default precios;
