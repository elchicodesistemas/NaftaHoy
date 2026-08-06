import { z } from "zod";
import { vPreciosSurtidor } from "../models/staging.js";

/*
  Whitelist explícita: los filtros solo pueden apuntar a estas 4 columnas.
  El nombre que llega por query string nunca se usa directo para resolver la
  columna — siempre pasa por este mapa, así un input arbitrario no puede
  hacer referencia a una columna que no querramos exponer.
*/
export const FILTROS_PRECIOS = {
  producto: vPreciosSurtidor.producto,
  empresa: vPreciosSurtidor.empresa,
  provincia: vPreciosSurtidor.provincia,
  region: vPreciosSurtidor.regionNormalizada,
} as const;

export const preciosQuerySchema = z.object({
  producto: z.string().min(1).optional(),
  empresa: z.string().min(1).optional(),
  provincia: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
