# Guía de integración — API NaftaHoy v2.0

> **v2.0 (2026-08-28)** — reemplaza por completo a la v1.0. La v1.0 documentaba la API en Hono con
> `POST /auth/token` y `GET /api/precios`; esa implementación se dio de baja en la unificación.
> Nada de lo que estaba acá antes sigue vigente: cambiaron el framework, las rutas, el modelo de
> datos y el modelo de autenticación.

## Base

| Entorno | Base URL |
|---|---|
| Local | `http://localhost:3001/api` |
| Producción | `https://naftahoy.com/api` |

Todo devuelve JSON. Los errores tienen forma `{ "error": "mensaje", "details": "…" }`.

## Autenticación

No hay login de usuario ni JWT. La API es **pública para lectura** y usa **dos tokens de servicio**
para las operaciones sensibles, ambos vía `Authorization: Bearer <token>`:

| Token | Variable de entorno | Habilita |
|---|---|---|
| Sincronización | `SYNC_API_TOKEN` | `POST /api/sync` |
| Administración | `ADMIN_API_TOKEN` | `GET /api/reports/pending`, `PATCH /api/reports/:id/status` |

La comparación es de tiempo constante (`timingSafeEqual`). Si el token no está configurado en el
servidor, el endpoint responde `503` en lugar de quedar abierto.

**No expongas estos tokens en el navegador.** Son secretos de servidor: van en `.env`, en el runner
de CI o en el gestor de secretos, nunca en el frontend ni en un enlace.

`POST /api/reports` no pide token pero está limitado a `REPORT_RATE_LIMIT_PER_HOUR` altas por hora
por hash de IP (default 5), y responde `429` al pasarse.

## Endpoints

### `GET /api/health`

Sin auth. Sirve para monitoreo.

```json
{
  "status": "ok",
  "timestamp": "2026-08-28T12:00:00.000Z",
  "database": "connected",
  "stats": { "stationsCount": 4821, "pricesCount": 96430 }
}
```

### `GET /api/prices/summary`

Sin auth. Es lo que alimenta la portada. Query opcional: `province` (match parcial, case-insensitive).

Toma el último precio **diurno** de cada estación y producto, promedia por marca, y calcula las
stats de cabecera sobre Nafta Súper.

```json
{
  "companies": [
    {
      "id": "ypf",
      "name": "YPF",
      "shortName": "YPF",
      "fuels": [
        { "type": "Nafta Súper", "price": 1234, "prevPrice": 1180 },
        { "type": "Nafta Premium", "price": 1450, "prevPrice": 1400 }
      ],
      "lastUpdate": "2026-08-27T00:00:00.000Z"
    }
  ],
  "stats": {
    "superAvg": 1250,
    "variationPct": 4.2,
    "cheapestBrand": "Puma",
    "cheapestPrice": 1190,
    "mostExpensiveBrand": "Shell",
    "mostExpensivePrice": 1310,
    "totalStations": 4821,
    "lastUpdated": "2026-08-27T00:00:00.000Z"
  },
  "isRealData": true
}
```

`isRealData: false` con todo en cero significa que la base todavía no tiene precios cargados —
el frontend debería mostrar un estado vacío, no ceros.

Marcas reconocidas en el resumen: `ypf`, `shell`, `axion`, `puma`. Las demás se ingestan y
aparecen en `/api/stations`, pero no en el resumen por marca.

Orden fijo de productos: Nafta Súper, Nafta Premium, Diesel, Diesel Premium, GNC.

### `GET /api/prices/trends`

Sin auth. Serie de los últimos 7 días de Nafta Súper (diurno), promedio diario por marca.

```json
[
  { "day": "lun", "date": "2026-08-24", "ypf": 1230, "shell": 1290, "axion": 1255, "puma": 1195 }
]
```

Las claves de marca aparecen sólo si hubo datos ese día — el consumidor no puede asumir que las
cuatro estén siempre.

### `GET /api/stations`

Sin auth. Sólo devuelve estaciones **con coordenadas** (`lat`/`lng` no nulos), pensado para el mapa.

| Query | Default | Nota |
|---|---|---|
| `brand` | — | slug en minúsculas (`ypf`, `shell`, …). `all` equivale a no filtrar |
| `province` | — | match parcial, case-insensitive |
| `city` | — | match parcial, case-insensitive |
| `limit` | `50` | **tope duro de 200** |

```json
{
  "count": 50,
  "stations": [
    {
      "id": "uuid",
      "govId": 12345,
      "name": "YPF - Av. Rivadavia 1234",
      "rawName": "ESTACION DE SERVICIO S.A.",
      "brand": "ypf",
      "brandName": "YPF",
      "address": "Av. Rivadavia 1234",
      "city": "CABA",
      "province": "Buenos Aires",
      "lat": -34.6,
      "lng": -58.4,
      "prices": { "super": 1234, "premium": 1450, "diesel": 1180, "gnc": null },
      "lastUpdate": "2026-08-27T10:00:00.000Z"
    }
  ]
}
```

Ojo con `name`: es un compuesto `brandName - address`, no el nombre legal. Ese está en `rawName`.

### Reportes de la comunidad

| Método | Ruta | Auth | Nota |
|---|---|---|---|
| `GET` | `/api/reports?limit=20` | — | Sólo `APPROVED`, tope 50 |
| `POST` | `/api/reports` | rate limit | Crea en estado `PENDING` |
| `POST` | `/api/reports/:id/like` | — | Sólo suma si el reporte está aprobado |
| `GET` | `/api/reports/pending?limit=50` | `ADMIN_API_TOKEN` | Cola de moderación, tope 100 |
| `PATCH` | `/api/reports/:id/status` | `ADMIN_API_TOKEN` | Body `{ "status": "APPROVED" \| "REJECTED" }` |

Body del alta:

```json
{
  "userName": "Juan",
  "province": "Buenos Aires",
  "city": "La Plata",
  "stationName": "Shell Av. 44",
  "brand": "shell",
  "fuelType": "Nafta Súper",
  "price": 1240
}
```

Validaciones del `POST`: `stationName` entre 3 y 120 caracteres, `brand` ≤ 40, `fuelType` ≤ 40,
`price` finito, `> 0` y `≤ 50000`. Cualquier fallo devuelve `400 { "error": "Faltan campos obligatorios" }`.
`userName`, `province` y `city` vacíos se completan solos ("Conductor anónimo", "No informado").

**Los reportes nunca se publican automáticamente.** Entran como `PENDING` y requieren moderación.

### Sincronización

`GET /api/sync/status` — sin auth. Estado en vivo + `totalStations`, `totalPrices` y los últimos
5 registros de `SyncLog`.

`POST /api/sync` — requiere `SYNC_API_TOKEN`. Corre la ingesta del CSV oficial de forma síncrona
(puede tardar). Con `?async=true` responde al toque y sigue en background.

```bash
curl -X POST "https://naftahoy.com/api/sync?async=true" \
  -H "Authorization: Bearer $SYNC_API_TOKEN"
```

La ingesta también corre sola según `CRON_SYNC_SCHEDULE` (default `0 */2 * * *`, cada 2 horas) y
al arrancar el servidor si la tabla `Station` está vacía.

## Quickstart local

```bash
cd backend
cp .env.example .env          # completar DATABASE_URL y los dos tokens
npm install
npm run prisma:generate
npm run prisma:migrate        # sólo la primera vez, contra una base propia
npm run dev                   # http://localhost:3001

curl http://localhost:3001/api/health
curl "http://localhost:3001/api/prices/summary?province=Buenos%20Aires"
```

Para poblar la base sin levantar el servidor: `npm run sync`.

## Notas para quien consuma esto desde el frontend

- El frontend del repo ya tiene el cliente escrito en `frontend/src/services/api.ts` con los tipos
  (`PriceSummaryResponse`, `StationDto`, `CommunityReportDto`). **Usarlo en vez de escribir `fetch`
  sueltos** — así los tipos quedan en un solo lugar cuando la API cambie.
- La base la define `NEXT_PUBLIC_API_URL` en build time. En Docker se inyecta como build arg.
- La portada usa ISR con `revalidate = 60`: los precios pueden estar hasta un minuto atrasados
  respecto de la API, y eso está bien — el dataset oficial se actualiza como mucho cada 2 horas.
