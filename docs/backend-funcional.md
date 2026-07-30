# Documentación funcional — Backend

Contraparte de `docs/frontend-funcional.md`: qué existe hoy en `backend/`, qué hace cada pieza a
nivel funcional (no de código) y qué falta para que el frontend pueda consumir datos reales. Para
las fuentes externas (Shell API, Energía, scraping) ver `docs/fuentes-datos.md` — este documento
es sobre la estructura interna (schema, worker, API planeada).

## 1. Objetivo del backend

Recibir precios de combustibles desde fuentes externas (oficiales y scraping), normalizarlos a un
formato único y exponerlos vía API REST interna para que el frontend arme la home (pizarra,
mapa, tendencias) y para que la comunidad pueda reportar precios cuando la fuente oficial no
alcanza. Es el mismo rol que cumple el backend de DolarHoy con las cotizaciones.

## 2. Estado actual — qué existe y qué no

| Pieza | Estado |
|---|---|
| Schema de base de datos (`src/models/schema.ts`) | ✅ Escrito y tipado, 8 tablas |
| Conexión a Postgres (`src/config/db.ts`) | ✅ Escrita (Drizzle + `pg`, timezone AR) |
| Worker de ingesta inicial (`src/workers/importarSurtidorEnergia.ts`) | ✅ Escrito, validado con `--dry-run` (4622 estaciones, 11 petroleras, 18355 precios) |
| Migración aplicada a la base real | ❌ Bloqueada por permiso `CREATE` en schema `public` (ver `CLAUDE.md`) |
| Servidor HTTP (Express) | ❌ No existe todavía — no hay `src/index.ts` ni `express` en `package.json` |
| Rutas (`src/routes/`) | ❌ Vacío (`.gitkeep`) |
| Servicios (`src/services/`) | ❌ Vacío (`.gitkeep`) |
| Auth (JWT, verificación de usuarios) | ❌ No implementado — solo existe la columna `usuarios.verificado` |
| Redis (cache de precios "en vivo") | ❌ No implementado, mencionado en `docs/arquitectura.md` como pendiente |
| Workers de YPF / Axion / Puma / Shell API | ❌ No escritos — solo el worker de "Precios en Surtidor" (fuente #3 de `fuentes-datos.md`) |

En criollo: **hay modelo de datos y un solo pipeline de ingesta funcionando (offline, sin API todavía)**. No hay una sola línea de servidor HTTP escrita — el frontend hoy no tiene nada real de qué consumir.

## 3. Modelo de datos, tabla por tabla

### 3.1 `petroleras`
- **Qué es**: catálogo de compañías (YPF, Shell, Axion, PAE, etc.).
- **Campos clave**: `nombre`, `slug` (debe matchear `BrandId` del frontend — hoy el frontend solo soporta 4 slugs, el dataset trae 11).
- **Consumida por (frontend)**: Ticker, PriceBoard, StationMap, CommunityReports — todo lo que muestra marca/color/logo.
- **Gap**: no tiene columna de color de marca ni logo. El frontend hoy hardcodea `BRAND_COLORS`/`BrandLogo` por slug fijo; si se agregan las 11 marcas reales sin tocar el frontend, quedan sin color/logo. Falta decidir si el color vive acá (columna `color_hex`) o se mantiene en frontend con un fallback genérico para marcas no mapeadas.

### 3.2 `estaciones`
- **Qué es**: una fila por estación de servicio física.
- **Campos clave**: `direccion`, `localidad`, `provincia`, `latitud`/`longitud`, `petroleraId`, `activa`, y `(fuente, externalId)` único para upsert idempotente entre corridas del worker.
- **Consumida por (frontend)**: StationMap (hoy usa 8 estaciones hardcodeadas, no esto).
- **Gap crítico de escala**: ~4622 estaciones reales vs. 8 en el mapa actual. No hay endpoint de bounding-box ni de paginación diseñado todavía — ver sección 5.
- **Nota**: `provincia`/`localidad` ya están acá, listos para el selector de zona que el frontend todavía no tiene (Hero muestra "CABA y GBA" fijo).

### 3.3 `precios_actuales`
- **Qué es**: snapshot del último precio conocido por `(estacion, tipo_combustible)` — un upsert por ingesta, no historial.
- **Campos clave**: `precio`, `fechaVigencia` (cuándo declaró la EESS ese precio), `fechaCapturado` (cuándo lo ingestamos nosotros), `fuente`.
- **Consumida por (frontend)**: es la tabla que debería alimentar PriceBoard, Ticker, Hero y StationMap.
- **Gap**: no guarda "precio anterior" como columna — el Ticker/PriceBoard necesitan la variación %, que hay que resolver comparando contra `precios_historico` en la query, no leyendo un campo plano (hoy el mock sí tiene un campo `prevPrice` plano — ver `frontend-funcional.md` 4.1).

### 3.4 `precios_historico`
- **Qué es**: log append-only, una fila por cada precio observado (nunca se pisa). Único por `(estacion, tipo_combustible, fecha_vigencia)` para no duplicar el mismo evento si el worker reintenta.
- **Consumida por (frontend)**: TrendChart (hoy hardcodeado a 7 días de YPF/Nafta Súper — el dato real sale de agrupar esta tabla por día).
- **Gap**: la granularidad real es "cada vez que una estación cambia precio", no "un punto por día" — hay que definir cómo se agrega a serie diaria (¿último precio del día? ¿promedio?) y si es por estación, por petrolera (promedio) o por provincia.

### 3.5 `ingesta_runs`
- **Qué es**: log de ejecuciones de los workers (estado, cuántos registros, error si falló).
- **Consumida por (frontend)**: nada directo — es observabilidad interna. Podría alimentar algo como "última actualización hace X min" en el futuro si se expone.

### 3.6 `usuarios`
- **Qué es**: cuentas para poder reportar precios. `verificado` boolean.
- **Consumida por (frontend)**: CommunityReports asume "solo usuarios verificados pueden reportar" — hoy es texto fijo sin lógica real.
- **Gap**: no hay rutas de registro/login/JWT. Sin esto, el formulario de reporte no puede funcionar de punta a punta.

### 3.7 `reportes_precio`
- **Qué es**: un precio reportado por un usuario (no oficial). `usuarioId` en `SET NULL` para no perder el reporte si se borra la cuenta.
- **Campos**: `petroleraId`, `estacionId` (opcional), `tipoCombustible`, `region` (texto libre), `precioReportado`.
- **Consumida por (frontend)**: CommunityReports — casi 1:1 con lo que ya muestra el drawer (`region` matchea literal).
- **Gap**: el form del frontend hoy solo pide "marca" + "precio" (le falta combustible y región, que acá son `NOT NULL`) — ver `frontend-funcional.md` 4.8.

### 3.8 `reporte_likes`
- **Qué es**: tabla M:N `reporte ↔ usuario`, PK compuesta. El conteo de likes se calcula con `COUNT()`, no se guarda como columna (mismo criterio que pagos en `LS_Jabones`).
- **Consumida por (frontend)**: contador de likes en cada card de CommunityReports.
- **Gap**: requiere el endpoint haga el `COUNT()` agregado — no es un simple `SELECT *`.

## 4. Flujo de ingesta actual (`importarSurtidorEnergia.ts`)

1. Lee un CSV del dataset "Precios en Surtidor" (Resolución 314/2016).
2. Filtra solo franja horaria "Diurno" y filas con lat/long (nuestro schema no modela franja horaria).
3. Mapea `idempresabandera` → petrolera canónica (11 marcas reales) y `producto` → `tipo_combustible` canónico (5 valores: `nafta_super`, `nafta_premium`, `diesel_comun`, `diesel_premium`, `gnc`).
4. Upsert en cascada: `petroleras` → `estaciones` (por `fuente`+`externalId`) → `precios_actuales` (upsert) + `precios_historico` (insert, `onConflictDoNothing`).
5. Registra la corrida en `ingesta_runs` (`ok`/`error`).
6. Corre manual por CLI (`npm run db:seed:estaciones -- <csv>`), no hay cron todavía.

Es un pipeline **batch, no en vivo** — no hay ingesta de Shell API ni scraping de YPF/Axion/Puma
escritos aún (fuentes #1, #5–8 de `fuentes-datos.md` siguen pendientes).

## 5. API que falta construir (propuesta mínima para conectar el frontend actual)

No hay rutas escritas. En base a lo que cada sección del frontend necesita (`frontend-funcional.md` §5), el mínimo viable sería:

| Endpoint (propuesto) | Para qué sección | Necesita resolver |
|---|---|---|
| `GET /petroleras` | Ticker, PriceBoard, StationMap, filtros | Devolver también color/logo si se decide que vive en backend (§3.1) |
| `GET /precios/actuales?agregacion=petrolera\|provincia\|estacion` | PriceBoard, Hero, Ticker | Definir nivel de agregación (gap #2 del frontend) y cálculo de variación % (join contra histórico) |
| `GET /precios/historico?combustible=&petrolera=&dias=7` | TrendChart | Definir cómo se arma "un punto por día" a partir del log append-only |
| `GET /estaciones?bbox=&provincia=&petrolera=` | StationMap | Bounding box o límite por zoom — necesario antes de conectar ~4622 puntos reales (gap #4 del frontend) |
| `GET /reportes` / `POST /reportes` | CommunityReports (listar + crear) | `POST` requiere auth verificada |
| `POST /reportes/:id/like` | CommunityReports (contador) | Requiere auth (evitar likes duplicados, ya cubierto por PK compuesta) |
| `POST /auth/registro`, `POST /auth/login` | CommunityReports (verificación) | JWT, hash de password (columna `password_hash` ya existe) |

No hay endpoint para "noticias" ni "próximo ajuste estimado" porque no hay tabla — son contenido
editorial (mismo gap que señala `frontend-funcional.md` §6.5 y §6.6).

## 6. Brechas para unificar con el frontend (cruce con `frontend-funcional.md` §6)

1. **Marcas**: backend/dataset trae 11 petroleras reales, frontend solo soporta 4 (`ypf`, `shell`, `axion`, `puma`). Falta decidir dónde vive el color de marca (columna nueva vs. mapa en frontend con fallback).
2. **Nivel de agregación de precios**: `precios_actuales` es por estación puntual; PriceBoard/Hero hoy asumen un promedio nacional por petrolera. Sin definir esto, no se puede escribir la query del endpoint de precios.
3. **Variación %**: no existe como columna, se calcula comparando `precios_actuales` contra el registro anterior en `precios_historico`. Falta definir la query (o desnormalizar un campo `precio_anterior` en la ingesta, a costo de duplicar dato).
4. **Escala del mapa**: 4622 estaciones reales vs. 8 hardcodeadas — sin endpoint de bounding box/clustering, conectar el mapa real no es viable tal cual está el componente.
5. **Auth**: `usuarios.verificado` existe en el schema pero no hay una sola ruta de registro/login/JWT — bloquea todo el flujo de reportes de punta a punta.
6. **Contenido editorial** (noticias, "próximo ajuste estimado"): no hay tabla ni planes de una — decidir si se arma un CMS mínimo o se saca del MVP.
7. **Selector de zona**: el schema ya soporta filtrar por `provincia`/`localidad`; falta que el frontend tenga el selector y que el endpoint de precios acepte esos filtros.
8. **Migración real sin aplicar**: hasta que no se resuelva el permiso de `CREATE` en `public` (bloqueante activo, ver `CLAUDE.md`), ninguna de las tablas de arriba existe en la base real — todo lo anterior es diseño, no datos disponibles.
