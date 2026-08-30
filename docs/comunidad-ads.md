# Comunidad, analítica y publicidad

## Voto de calidad por marca

- `GET /api/polls/fuel-quality` devuelve opciones dinámicas, votos y porcentajes.
- `POST /api/polls/fuel-quality/vote` recibe `{ "brand": "ypf" }` y usa una cookie firmada `HttpOnly` emitida por el servidor durante el `GET` previo. El identificador enviado por JavaScript no participa en la decisión.
- Se implementó un voto por visitante anónimo. Un segundo voto devuelve `409`, existe un límite de intentos por origen y no se permite cambiarlo en esta etapa.

## Valoraciones futuras de estación

- `GET /api/stations/:id/ratings` devuelve promedios y cantidad de valoraciones.
- `POST /api/stations/:id/ratings` acepta `fuelQuality`, `service`, `cleanliness` y `speed` (1 a 5) más el encabezado de visitante.
- La interfaz de detalle de estación no existe aún; los endpoints y el modelo quedan listos para integrarla sin alterar el mapa actual.

## Publicidad propia

Placements disponibles: `home-top`, `home-middle`, `station-detail`, `sidebar`.

- `GET /api/ads/:placement` devuelve una sola publicidad activa dentro de las fechas de una campaña activa y anunciante activo.
- `POST /api/ads/:adId/impression` y `POST /api/ads/:adId/click` reciben `{ "placement", "pagePath" }` y opcionalmente el encabezado de visitante.
- `GET /api/ads/admin/metrics?campaignId=<uuid>` (o `adId=<uuid>`) requiere `Authorization: Bearer <ADMIN_API_TOKEN>` y devuelve impresiones, clicks y CTR.

Ejemplos de verificación SQL:

```sql
SELECT brand, COUNT(*) FROM "FuelQualityVote" GROUP BY brand ORDER BY count DESC;
SELECT "adId", COUNT(*) AS impressions FROM "AdImpression" GROUP BY "adId";
SELECT "adId", COUNT(*) AS clicks FROM "AdClick" GROUP BY "adId";
```

## Google Analytics

Definí `NEXT_PUBLIC_GA_MEASUREMENT_ID` en `frontend/.env.local`. Si falta, no se carga ningún script de GA4. Los eventos centrales son: `page_view`, `search_performed`, `station_viewed`, `fuel_quality_vote`, `ad_impression` y `ad_click`.
