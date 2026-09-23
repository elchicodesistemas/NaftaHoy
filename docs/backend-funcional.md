# Backend — cómo funciona por dentro

> Actualizado 2026-08-28. Describe el backend vigente (Express + Prisma). La versión anterior de
> este documento describía el backend en Hono + Drizzle, dado de baja en la unificación.

## Mapa de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma              # 4 modelos: Station, PriceRecord, SyncLog, CommunityReport
│   └── migrations/                # SQL generado por Prisma — no editar a mano
├── src/
│   ├── server.ts                  # entrypoint: Express, CORS, headers, rutas, boot, shutdown
│   ├── config/
│   │   ├── index.ts               # lee .env y expone `config`
│   │   └── prisma.ts              # instancia única de PrismaClient
│   ├── routes/                    # capa fina: valida, delega, serializa
│   │   ├── prices.ts              # /api/prices/summary, /trends
│   │   ├── stations.ts            # /api/stations
│   │   ├── reports.ts             # /api/reports (+ moderación)
│   │   └── sync.ts                # /api/sync, /api/sync/status
│   ├── services/
│   │   ├── priceService.ts        # toda la lógica de consulta y agregación
│   │   └── govIngestionService.ts # descarga + normalización + upsert del CSV oficial
│   ├── utils/security.ts          # tokens de servicio, rate limit, hash de IP
│   └── workers/cronWorker.ts      # agenda la ingesta con node-cron
└── tests/normalization.test.js    # node --test sobre la normalización de marcas/productos
```

## Flujo de datos

```
datos.energia.gob.ar (CSV Res. 314/2016)
        │
        ▼
govIngestionService.syncLatestPrices()
        │  descarga → parsea (csv-parser) → normaliza marca y producto
        │  → upsert Station (clave govId) → upsert PriceRecord
        │  → escribe SyncLog (RUNNING → SUCCESS | FAILED)
        ▼
   PostgreSQL (Prisma)
        │
        ▼
   priceService  ──►  routes  ──►  JSON  ──►  frontend/src/services/api.ts
```

Disparadores de la ingesta, en orden de importancia:

1. **Cron** — `cronWorker.initCronWorker()` con `CRON_SYNC_SCHEDULE` (default cada 2 horas).
2. **Boot** — `server.ts` cuenta `Station`; si es 0, dispara una sincronización en background.
3. **Manual** — `POST /api/sync` con `SYNC_API_TOKEN`, o `npm run sync` desde la consola.

## Modelo de datos

- **`Station`** — una estación de servicio. `govId` es la clave natural del dataset oficial (única).
  `brand` es el slug normalizado (`ypf`, `shell`, `axion`, `puma`, `dapsa`, `gulf`, `blanca`, …) y
  `brandName` el nombre visible. Índices por `province`, `brand` y `(lat, lng)`.
- **`PriceRecord`** — un precio por estación, producto, franja horaria y fecha de vigencia.
  La clave única `(stationId, fuelType, timeSlot, effectiveDate)` es lo que hace idempotente a la
  ingesta: correrla dos veces no duplica nada. `fuelType` es el slug (`SUPER`, `PREMIUM`, `DIESEL`,
  `DIESEL_PREMIUM`, `GNC`), `originalProduct` guarda el texto crudo del CSV para poder auditar la
  normalización.
- **`SyncLog`** — traza de cada corrida: `status` (`RUNNING`/`SUCCESS`/`FAILED`), cuántos registros
  y estaciones procesó, el error si falló. Es lo que hay que mirar cuando los precios no se actualizan.
- **`CommunityReport`** — precio reportado por un usuario. Nace `PENDING` y no se muestra hasta que
  alguien lo aprueba. `ipHash` es un SHA-256 de la IP, para rate limit y abuso, nunca la IP en claro.

## Decisiones que conviene no romper

- **Sólo franja diurna en las agregaciones.** `getSummary`, `getStations` y `getTrends` filtran
  `timeSlot = "Diurno"`. Mezclar diurno y nocturno ensucia los promedios.
- **El resumen por marca cubre sólo YPF, Shell, Axion y Puma.** Las demás marcas se ingestan y
  salen por `/api/stations`, pero no entran en la portada. Para sumar una marca, se agrega al mapa
  `brands` de `priceService.ts`.
- **`getStations` exige coordenadas.** Es un endpoint para el mapa; una estación sin `lat`/`lng` no
  sirve ahí. Si hace falta un listado completo, es un endpoint nuevo, no un flag en este.
- **Topes duros de paginación** (200 estaciones, 50 reportes, 100 pendientes). Están para que un
  `limit=999999` no tire la base.
- **Las rutas no consultan Prisma directamente** (salvo `sync.ts`, que lee `SyncLog` y conteos).
  Lógica nueva va en `priceService.ts`.
- **`prisma` es una instancia única** importada de `config/prisma.ts`. No instanciar `PrismaClient`
  en otro lado: se acaban las conexiones del pool.

## Puntos flojos conocidos

- El rate limit vive en memoria del proceso. Con más de una réplica del contenedor deja de ser
  efectivo — ahí hay que mover el contador a Redis.
- `getSummary` trae **todos** los `PriceRecord` que matchean y agrega en Node. Anda bien con el
  volumen actual, pero es el primer lugar que va a doler cuando crezca el histórico. La salida
  natural es una tabla de agregados o una vista materializada refrescada por la ingesta.
- No hay caché entre la API y la base. La portada se apoya en el ISR de Next (60 s), lo cual alcanza
  hoy porque el dataset oficial cambia cada 2 horas como mucho.
- La moderación de reportes se hace con `curl` y un token compartido. No hay panel ni usuarios.

## Variables de entorno

Ver `backend/.env.example`. Las que importan:

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `PORT` | Puerto del server (default 3001) |
| `CORS_ORIGIN` | Lista blanca separada por comas |
| `SYNC_API_TOKEN` | Protege `POST /api/sync` |
| `ADMIN_API_TOKEN` | Protege la moderación de reportes |
| `REPORT_RATE_LIMIT_PER_HOUR` | Altas de reporte por IP por hora (default 5) |
| `GOV_DATASET_CSV_URL` | CSV oficial de la Secretaría de Energía |
| `CRON_SYNC_SCHEDULE` | Cron de la ingesta (default `0 */2 * * *`) |

`.env` nunca va a git. En cada máquina se recrea copiando `.env.example`.
