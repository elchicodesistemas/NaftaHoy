import {
  doublePrecision,
  integer,
  numeric,
  pgView,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/*
  v_precios_surtidor ya existe en naftahoy_prueba — la cargó alguien por fuera
  del pipeline del repo (no la crea importarSurtidorEnergia.ts ni ninguna
  migración de acá). Se declara con .existing() a propósito: drizzle-kit nunca
  debe intentar crearla ni versionarla. Este archivo tampoco está en el
  "schema" de drizzle.config.ts, así que db:generate ni la ve.

  Es la fuente de datos temporal para la API (paso 8) mientras se decide si
  se migra a las tablas normalizadas de schema.ts (estaciones/precios_actuales).
*/
export const vPreciosSurtidor = pgView("v_precios_surtidor", {
  indiceTiempo: text("indice_tiempo"),
  idEmpresa: integer("idempresa"),
  cuit: text("cuit"),
  empresa: text("empresa"),
  direccion: text("direccion"),
  localidad: text("localidad"),
  provincia: text("provincia"),
  region: text("region"),
  idProducto: integer("idproducto"),
  producto: text("producto"),
  idTipoHorario: integer("idtipohorario"),
  tipoHorario: text("tipohorario"),
  precio: numeric("precio"),
  fechaVigencia: timestamp("fecha_vigencia", { withTimezone: true }),
  idEmpresaBandera: integer("idempresabandera"),
  empresaBandera: text("empresabandera"),
  latitud: doublePrecision("latitud"),
  longitud: doublePrecision("longitud"),
  geojson: text("geojson"),
  regionNormalizada: text("region_normalizada"),
}).existing();
