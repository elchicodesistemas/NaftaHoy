# NAFTAHOY — Contexto para Claude Code

> **Actualizado 2026-08-28 tras la unificación con `main`.** Si venís de una sesión anterior
> que hablaba de Hono y Drizzle: eso ya no existe. Leé "Qué cambió" antes de tocar nada.

## El proyecto en una línea

Portal de precios de combustibles en tiempo real para Argentina, modelo DolarHoy.com — ingesta
el dataset oficial de la Secretaría de Energía y lo expone normalizado por marca, provincia y producto.

## Estado actual

- **Sitio en producción**: https://naftahoy.com (Docker Compose + Nginx)
- **Repo**: https://github.com/elchicodesistemas/NaftaHoy
- **Frontend**: Next.js 14 App Router, consumiendo la API real vía ISR (`revalidate = 60`)
- **Backend**: Node 20 + Express + Prisma + PostgreSQL, con ingesta oficial programada por cron
- **Idioma de trabajo**: español (commits, PRs, docs, comentarios)

## Qué cambió (unificación 2026-08-28)

Durante agosto el proyecto se bifurcó en dos implementaciones paralelas del mismo producto:

| | `feature/rediseno-frontend` (descartada) | `main` (vigente) |
|---|---|---|
| Framework API | Hono | **Express** |
| ORM | Drizzle | **Prisma** |
| Datos | lectura de la vista `v_precios_surtidor` | **ingesta propia del CSV oficial** (`govIngestionService`) |
| Auth | JWT + tabla `integradores` + bcrypt | **tokens de servicio** (`SYNC_API_TOKEN`, `ADMIN_API_TOKEN`) |
| Rutas | `/api/precios`, `/auth/token` | `/api/prices`, `/api/stations`, `/api/reports`, `/api/sync` |
| Infra | vacía | Docker, Nginx, CI, backups |

**Se adoptó `main` como base**: es lo que corre en producción y lo que tiene el pipeline de datos
funcionando. El backend Hono/Drizzle se dio de baja por completo — no hay convivencia, no hay
puente, no hay período de transición. Lo que sobrevivió de la rama vieja es la gobernanza
(este archivo, `FICHA_MADUREZ.md`, `docs/`, `.claude/`) y la config de Biome.

**Regla dura que sale de esto**: la API es la de `main`. Cualquier necesidad nueva del frontend se
resuelve agregando o extendiendo endpoints en `backend/src/routes/` sobre Express + Prisma, nunca
levantando un servicio paralelo.

## Equipo y división de trabajo

- **Colaborador (otro dev)**: infraestructura, dominio, deploy, VPS, Nginx, Docker — y desde
  agosto también el backend y la ingesta oficial.
- **Usuario + Claude Code**: frontend (Next.js + Leaflet), documentación, y features de backend
  acordadas con el colaborador.

**Claude Code NO toca**:
- Carpeta `infrastructure/`
- Configs de Nginx, Docker, deploy scripts
- Rama `infrastructure` (es del colaborador)
- Variables de entorno de producción
- El esquema de Prisma sin avisar — la base de producción ya tiene datos cargados

## Stack

### Frontend (`frontend/`)
- Next.js 14 (App Router en `src/app/`), TypeScript strict, alias `@/*` → `frontend/src/*`
- Tailwind 3.4, dark mode por clase, tema en `frontend/tailwind.config.ts`
  (paleta pastel `accent.amber/red/green/blue/purple/cyan`, `brand.primary #e8a849`, tipografía Inter)
- Iconos: `lucide-react` — no instalar otra librería de íconos
- Mapas: **Leaflet 1.9.4 cargado via CDN dentro de `useEffect`**, no como dependencia npm.
  Ver el patrón en `frontend/src/components/StationMap.tsx`. Mantenerlo en componentes nuevos.
  (Por eso no hay `package.json` en la raíz del repo — el que existía con `leaflet`/`react-leaflet`
  era huérfano y se eliminó.)
- **Datos**: `frontend/src/services/api.ts` es el único punto de contacto con el backend.
  `NEXT_PUBLIC_API_URL` define la base (default `http://localhost:3001/api`).
  `page.tsx` es un Server Component que hace `api.getPriceSummary()` con `revalidate = 60` y le
  pasa los datos a `HomeClient`. No agregar `fetch` sueltos en componentes: todo pasa por `services/api.ts`.
- SEO ya resuelto: `layout.tsx` (metadata + OpenGraph), `sitemap.ts`, `robots.ts`, `manifest.ts`,
  `JsonLd.tsx`. No romperlo.

### Backend (`backend/`)
- Node.js 20 + **Express 4** + TypeScript. Entrypoint `backend/src/server.ts` (puerto `3001` vía `PORT`).
- **ORM: Prisma 5**, schema en `backend/prisma/schema.prisma`, cliente en `backend/src/config/prisma.ts`.
  Modelos: `Station`, `PriceRecord`, `SyncLog`, `CommunityReport`.
  Migraciones en `backend/prisma/migrations/`. Comandos: `npm run prisma:generate`,
  `prisma:migrate` (dev), `prisma:push`. **Nunca editar el SQL generado a mano.**
- Config centralizada en `backend/src/config/index.ts` (lee `.env` con dotenv). Copiar
  `backend/.env.example` → `backend/.env` en cada máquina; nunca viaja por git.
- **Ingesta oficial**: `backend/src/services/govIngestionService.ts` baja el CSV de
  `datos.energia.gob.ar` (Resolución 314/2016), normaliza marcas y productos, y hace upsert
  contra `Station`/`PriceRecord`, dejando traza en `SyncLog`.
  `backend/src/workers/cronWorker.ts` la agenda con `node-cron` (`CRON_SYNC_SCHEDULE`, default cada 2 h).
  Al arrancar, si `Station` está vacía, dispara una primera sincronización en background.
- **Lógica de consulta**: `backend/src/services/priceService.ts` (resumen, tendencias, estaciones,
  reportes de la comunidad). Las rutas son finas: validan, delegan, serializan.
- **Seguridad** (`backend/src/utils/security.ts`):
  - `requireSyncToken` → `POST /api/sync`, compara `Authorization: Bearer` contra `SYNC_API_TOKEN`
    con `timingSafeEqual`.
  - `requireAdminToken` → `GET /api/reports/pending` y `PATCH /api/reports/:id/status`, contra `ADMIN_API_TOKEN`.
  - `reportRateLimit` → `POST /api/reports`, N por hora por hash de IP (`REPORT_RATE_LIMIT_PER_HOUR`, default 5).
  - `clientHash` guarda un SHA-256 de la IP en `CommunityReport.ipHash`, nunca la IP en claro.
  - Headers de seguridad y CORS por lista blanca (`CORS_ORIGIN`) en `server.ts`.
  - **No hay auth por usuario todavía.** Son tokens de servicio compartidos. Si más adelante hace
    falta un flujo por integrador, se construye **sobre los modelos de Prisma existentes** y sobre
    este middleware, no reintroduciendo la tabla `integradores` de la rama vieja.
- Tests: `backend/tests/normalization.test.js` con el runner nativo (`node --test`). `npm test` compila y corre.
- Lint/formato: Biome (`biome.json` en la raíz; `backend/biome.json` y `frontend/biome.json` heredan con `extends: "//"`).

### Endpoints vigentes

| Método | Ruta | Auth | Para qué |
|---|---|---|---|
| `GET` | `/api/health` | — | Estado + conteo de estaciones y precios |
| `GET` | `/api/prices/summary` | — | Resumen por marca + stats de portada (`?province=`) |
| `GET` | `/api/prices/trends` | — | Serie de tendencias |
| `GET` | `/api/stations` | — | Estaciones (`?brand=&province=&city=&limit=`) |
| `GET` | `/api/reports` | — | Reportes aprobados de la comunidad (`?limit=`) |
| `POST` | `/api/reports` | rate limit | Alta de reporte (queda `PENDING`) |
| `POST` | `/api/reports/:id/like` | — | Sumar like |
| `GET` | `/api/reports/pending` | `ADMIN_API_TOKEN` | Moderación |
| `PATCH` | `/api/reports/:id/status` | `ADMIN_API_TOKEN` | `APPROVED` / `REJECTED` |
| `GET` | `/api/sync/status` | — | Última sincronización + últimos `SyncLog` |
| `POST` | `/api/sync` | `SYNC_API_TOKEN` | Disparar ingesta (`?async=true` para background) |

### Infraestructura (fuera de alcance)
- `infrastructure/docker/` (compose + Dockerfiles), `infrastructure/nginx/naftahoy.conf`,
  `infrastructure/scripts/` (backup/restore de Postgres). Manejado por el colaborador.
- CI en `.github/workflows/ci.yml`: tests de backend, build de frontend y validación del compose.

## Workflow de git (estricto — leer `CONTRIBUTING.md` para el detalle)

### Ramas
- `main` = releases estables, **conectada a producción (naftahoy.com)**
- `develop` = rama de integración — **ojo: quedó desactualizada** (apunta a mayo). Antes de usarla
  hay que resincronizarla con `main`; hablarlo con el colaborador.
- `feature/<nombre>` = funcionalidades nuevas (lo normal)
- `hotfix/<nombre>` = fixes urgentes
- `infrastructure` = rama del colaborador, **no tocar**

### Reglas duras
- **NUNCA** push directo a `main` o `develop`
- **NUNCA** force-push
- **NUNCA** `git reset --hard` sin pedir permiso
- **NUNCA** mergear desde Claude — los PRs los revisa y mergea el equipo en GitHub
- **NUNCA** modificar `.gitignore` para incluir archivos sensibles (`.env`, credenciales, `node_modules/`)

### Flujo estándar para Claude
1. Antes de codear: `git fetch origin` y `git status`. Si estás en `develop` o `main`, crear
   `feature/<nombre-descriptivo>` con `git switch -c`.
2. Codear.
3. Commit con formato fechado (ver abajo).
4. `git push origin feature/<nombre>`.
5. `gh pr create --base main` con descripción de qué y por qué (mientras `develop` siga desfasada).
6. Avisar al usuario que el PR está listo para review.

### Formato de commits (obligatorio)
```
[YYYY-MM-DD] tipo: descripción breve en español
```

| Tipo | Uso |
|------|-----|
| `estructura` | Organización de carpetas/archivos |
| `feature` | Nueva funcionalidad |
| `fix` | Corrección de bugs |
| `docs` | Cambios en documentación |
| `infra` | Servidor, Docker, Nginx (rara vez para nosotros) |
| `refactor` | Mejora de código sin cambiar funcionalidad |
| `test` | Tests |
| `style` | Formato/estilo sin cambio lógico |

Ejemplo: `[2026-08-28] feature: agregar filtro por provincia en PriceTable`

### Estrategia de merge
- "Squash and merge" en GitHub, commits atómicos.
- **Lección de la unificación**: nunca volver a mergear una historia huérfana con
  `--strategy=ours` / `-X ours`. El merge `ad6a368` descartó en silencio todo el árbol del otro
  lado. Si dos líneas divergen tanto, se elige una explícitamente y se re-aporta lo que valga
  encima, dejando la otra rama viva como respaldo.

## Trabajo multi-máquina (Máquina 1 personal / Máquina 2 laburo)

El usuario alterna entre dos máquinas sobre el mismo repo. La sincronización es GitHub — no hay
otro canal — así que **antes de escribir código, `git fetch` y chequear que el commit más reciente
sea el esperado**. Puede haber trabajo de la otra máquina, o del colaborador, sin traer.

Al cerrar una sesión (antes o junto con el commit final):
1. Agregar una entrada en `docs/registro-sesiones.md` — fecha, qué máquina (1 o 2), 2-5 bullets.
   Resumido: el detalle vive en los mensajes de commit; esto es para ubicarse rápido.
2. Confirmar que ese commit quede pusheado.

## Convenciones de código frontend

- Un componente por archivo, `.tsx`, en `frontend/src/components/`
- Páginas en `frontend/src/app/`
- Reutilizar la paleta de Tailwind del tema custom — no hardcodear hex
- Reutilizar iconos de `lucide-react`
- Antes de proponer un componente nuevo, revisar los existentes por si ya hay algo reutilizable
- Todo dato del backend entra por `frontend/src/services/api.ts`

## Archivos de referencia importantes

- `CONTRIBUTING.md` — detalle completo del workflow de git
- `docs/registro-sesiones.md` — qué se hizo en cada sesión y desde qué máquina (leer al arrancar)
- `docs/api-guia-integracion.md` — endpoints, auth y quickstart de la API vigente
- `docs/backend-funcional.md` — cómo funciona el backend por dentro
- `docs/frontend-funcional.md` — componentes y mapeo del rediseño
- `docs/produccion.md`, `docs/servidor.md`, `docs/guia-deploy.md` — operación (del colaborador)
- `docs/fuentes-datos.md` — origen del dataset oficial
- `frontend/src/components/StationMap.tsx` — patrón de Leaflet via CDN
- `NAFTAHOY_Mapa_Proyecto.html` — arquitectura propuesta del proyecto completo
