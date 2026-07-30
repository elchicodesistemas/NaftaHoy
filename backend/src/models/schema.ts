import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/*
  tipo_combustible es texto libre (no enum nativo, mismo criterio que LS_Jabones)
  para no depender de ALTER TYPE al sumar variantes. Valores canónicos, iguales al
  formato unificado de docs/fuentes-datos.md:
  'nafta_super' | 'nafta_premium' | 'diesel_comun' | 'diesel_premium' | 'gnc'
  Nombres comerciales por petrolera (Infinia, V-Power, Quantium) se mapean a estos
  valores en la capa de ingesta/normalización, no viven en la base.
*/

export const petroleras = pgTable('petroleras', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull().unique(), // "YPF", "Shell", "Axion Energy", "Puma Energy"
  slug: text('slug').notNull().unique(), // debe matchear BrandId de frontend/src/lib/brands.ts
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Una fila por estación de servicio. (fuente, external_id) identifica la fila de
// origen en la fuente externa para poder hacer upsert idempotente en cada ingesta.
export const estaciones = pgTable(
  'estaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    petroleraId: uuid('petrolera_id')
      .notNull()
      .references(() => petroleras.id, { onDelete: 'restrict' }),
    nombre: text('nombre').notNull(),
    direccion: text('direccion').notNull(),
    localidad: text('localidad').notNull(),
    provincia: text('provincia').notNull(),
    latitud: numeric('latitud', { precision: 9, scale: 6 }).notNull(),
    longitud: numeric('longitud', { precision: 9, scale: 6 }).notNull(),
    fuente: text('fuente').notNull(), // 'shell-api' | 'energia-datos-abiertos' | 'scraping-surtidor'
    externalId: text('external_id').notNull(),
    activa: boolean('activa').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('estaciones_fuente_external_id_unique').on(table.fuente, table.externalId),
    index('estaciones_provincia_localidad_idx').on(table.provincia, table.localidad),
    index('estaciones_petrolera_idx').on(table.petroleraId),
  ],
);

// Snapshot del último precio conocido por estación+combustible, upsert en cada
// ingesta. Es lo que lee el home/mapa/pizarra; Redis cachea esta tabla, no la reemplaza.
export const preciosActuales = pgTable(
  'precios_actuales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    estacionId: uuid('estacion_id')
      .notNull()
      .references(() => estaciones.id, { onDelete: 'cascade' }),
    tipoCombustible: text('tipo_combustible').notNull(),
    precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
    moneda: text('moneda').notNull().default('ARS'),
    fechaVigencia: timestamp('fecha_vigencia', { withTimezone: true }).notNull(),
    fechaCapturado: timestamp('fecha_capturado', { withTimezone: true }).notNull().defaultNow(),
    fuente: text('fuente').notNull(),
  },
  (table) => [
    unique('precios_actuales_estacion_combustible_unique').on(table.estacionId, table.tipoCombustible),
  ],
);

// Log histórico append-only de cada precio observado — alimenta los gráficos de
// tendencia semanal. No se pisa: cada cambio de precio es una fila nueva.
export const preciosHistorico = pgTable(
  'precios_historico',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    estacionId: uuid('estacion_id')
      .notNull()
      .references(() => estaciones.id, { onDelete: 'cascade' }),
    tipoCombustible: text('tipo_combustible').notNull(),
    precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
    moneda: text('moneda').notNull().default('ARS'),
    fechaVigencia: timestamp('fecha_vigencia', { withTimezone: true }).notNull(),
    fuente: text('fuente').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // evita duplicar el mismo evento de precio si un worker se reintenta sobre la misma fuente
    unique('precios_historico_estacion_combustible_vigencia_unique').on(
      table.estacionId,
      table.tipoCombustible,
      table.fechaVigencia,
    ),
    index('precios_historico_tendencia_idx').on(table.tipoCombustible, table.fechaVigencia),
  ],
);

// Ejecuciones de los workers de ingesta. Observabilidad necesaria porque el
// pipeline depende de fuentes externas inestables (scraping sin API oficial en
// YPF/Axion/Puma, ver docs/fuentes-datos.md).
export const ingestaRuns = pgTable('ingesta_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  fuente: text('fuente').notNull(),
  estado: text('estado').notNull().default('en_progreso'), // 'en_progreso' | 'ok' | 'error'
  registrosProcesados: integer('registros_procesados').notNull().default(0),
  errorMensaje: text('error_mensaje'),
  iniciadoEn: timestamp('iniciado_en', { withTimezone: true }).notNull().defaultNow(),
  finalizadoEn: timestamp('finalizado_en', { withTimezone: true }),
});

// Cuenta liviana para reportes comunitarios (frontend: CommunityReports.tsx,
// "solo usuarios verificados pueden reportar precios"). El flujo de auth
// (JWT, verificación) se construye cuando se armen las rutas — esto es solo
// la base relacional para poder referenciar quién reportó qué.
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  verificado: boolean('verificado').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Precio reportado por un usuario, como el drawer "Reportes de la comunidad"
// del frontend. usuarioId en SET NULL: si se borra la cuenta, el reporte
// histórico queda (anonimizado) en vez de desaparecer.
export const reportesPrecio = pgTable('reportes_precio', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }),
  petroleraId: uuid('petrolera_id')
    .notNull()
    .references(() => petroleras.id, { onDelete: 'restrict' }),
  estacionId: uuid('estacion_id').references(() => estaciones.id, { onDelete: 'set null' }),
  tipoCombustible: text('tipo_combustible').notNull(),
  region: text('region').notNull(), // texto libre, ej. "CABA - Palermo"
  precioReportado: numeric('precio_reportado', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// M:N reporte↔usuario para los likes. El conteo se calcula con COUNT() sobre esta
// tabla en vez de guardarse como columna — mismo criterio que el estado de pago
// en LS_Jabones (order_payments), evita que el contador se desincronice.
export const reporteLikes = pgTable(
  'reporte_likes',
  {
    reporteId: uuid('reporte_id')
      .notNull()
      .references(() => reportesPrecio.id, { onDelete: 'cascade' }),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.reporteId, table.usuarioId] })],
);
