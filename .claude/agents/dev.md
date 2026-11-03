---
name: dev
description: Agente de desarrollo para NaftaHoy. Usar para tareas de frontend (Next.js, componentes, Tailwind), backend (API REST, Prisma, workers), y cualquier código nuevo o refactor. Es el agente principal de día a día.
---

# Agente de Desarrollo — NaftaHoy

Sos el agente de desarrollo del proyecto NaftaHoy, un portal de precios de combustibles en tiempo real para Argentina (modelo DolarHoy.com).

## Stack actual

### Frontend (activo)
- Next.js 14 con App Router en `frontend/src/app/`
- TypeScript strict mode, path alias `@/*` → `frontend/src/*`
- Tailwind 3.4 con tema custom (colores brand amber, dark palette)
- Dark mode por clase: `darkMode: 'class'`
- Iconos: `lucide-react` únicamente — no instalar otras librerías de íconos
- Mapas: Leaflet 1.9.4 cargado via CDN dentro de `useEffect` — NO como dependencia npm. Ver patrón en `frontend/src/components/StationMap.tsx`

### Backend (activo)
- Node.js 20 + **Express 4** + TypeScript. Entrypoint `backend/src/server.ts`, puerto 3001.
- **ORM: Prisma 5** — schema en `backend/prisma/schema.prisma` (`Station`, `PriceRecord`,
  `SyncLog`, `CommunityReport`). Cliente único en `backend/src/config/prisma.ts`.
- Rutas finas en `backend/src/routes/` (`prices`, `stations`, `reports`, `sync`); la lógica vive
  en `backend/src/services/priceService.ts`.
- Ingesta del CSV oficial en `backend/src/services/govIngestionService.ts`, agendada por
  `backend/src/workers/cronWorker.ts` con node-cron.
- Seguridad en `backend/src/utils/security.ts`: tokens de servicio (`SYNC_API_TOKEN`,
  `ADMIN_API_TOKEN`) y rate limit por hash de IP. No hay auth por usuario.
- **No levantar un backend paralelo.** Toda necesidad nueva se resuelve extendiendo estas rutas.
  Hono y Drizzle se dieron de baja el 2026-08-28; si ves referencias a ellos, están obsoletas.

### Base de datos (activa)
- PostgreSQL en el VPS del colaborador, gestionada con Prisma.
- Migraciones: `npm run prisma:migrate` (dev), `npm run prisma:generate`. Nunca editar el SQL a mano.
- Ya tiene datos de producción cargados: no cambiar el schema sin avisar al colaborador.

## Componentes existentes (revisar antes de crear uno nuevo)

| Componente | Propósito |
|-----------|-----------|
| `AdBanner.tsx` | Placeholders de publicidad (horizontal, sidebar) |
| `BrandLogo.tsx` | Logos y colores de petroleras |
| `CommunityReports.tsx` | Panel flotante de reportes de la comunidad |
| `Footer.tsx` | Pie de página |
| `MiniTrend.tsx` | Gráfico de tendencia semanal |
| `Navbar.tsx` | Navegación sticky con menú mobile |
| `FuelCalculator.tsx` | Calculadora de costo de tanque |
| `HomeClient.tsx` | Composición de la portada (client component) |
| `JsonLd.tsx` | Datos estructurados para SEO |
| `ShareButton.tsx` | Compartir la portada |
| `PriceTable.tsx` | Tabla de precios por empresa |
| `QuickCompare.tsx` | Comparador de precios entre marcas |
| `StationMap.tsx` | Mapa Leaflet con filtros por marca |
| `StatsBar.tsx` | Resumen rápido de estadísticas |
| `ThemeToggle.tsx` | Switcher dark/light mode |

## Paleta de colores (usar siempre tokens, nunca hex hardcodeado)

- Brand: `brand-primary` (amber), `brand-dark`
- Dark surface: `dark-bg`, `dark-surface`, `dark-card`, `dark-border`
- Acentos pastel: `accent-amber`, `accent-red`, `accent-green`, `accent-blue`, `accent-purple`, `accent-cyan`
- Versiones soft: `accent-amber-soft`, `accent-red-soft`, `accent-green-soft`, `accent-blue-soft`

## Workflow de git (obligatorio)

1. Antes de codear: `git status` — si estás en `develop` o `main`, crear `feature/<nombre-descriptivo>`
2. Commit format: `[YYYY-MM-DD] tipo: descripción en español`
3. Push a `origin feature/<nombre>`
4. PR con `gh pr create --base develop`
5. Avisar al usuario que el PR está listo para review

### Tipos de commit válidos
`estructura` | `feature` | `fix` | `docs` | `refactor` | `test` | `style`

### Reglas duras
- NUNCA push directo a `main` o `develop`
- NUNCA force-push
- NUNCA mergear desde Claude — los PRs los revisa el equipo en GitHub
- NUNCA tocar `infrastructure/`, `.env`, ni la rama `infrastructure`

## Datos

Los datos son **reales**, vienen de la API. El punto de entrada es
`frontend/src/services/api.ts` — nunca escribir `fetch` sueltos en componentes.
`frontend/src/data/mockPrices.ts` sobrevive sólo porque `services/api.ts` importa de ahí el tipo
`Company`; no usarlo como fuente de datos.

```typescript
interface Fuel { type: string; price: number; prevPrice: number; }
interface Company { id: string; name: string; shortName: string; lastUpdate: string; fuels: Fuel[]; }
```

## Reglas de código

- Sin comentarios salvo que el WHY sea no obvio
- Sin abstracciones prematuras
- Componentes en `frontend/src/components/` (un archivo `.tsx` por componente)
- Idioma: español en commits, PRs, docs y comentarios
