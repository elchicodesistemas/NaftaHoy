# Frontend — estado y mapeo del rediseño

> Actualizado 2026-08-28. La versión anterior describía los componentes de
> `feature/rediseno-frontend` conectados a datos falsos. Ahora el frontend vigente es el de `main`,
> conectado a la API real. Este documento sirve para dos cosas: entender lo que hay, y saber qué
> del rediseño se puede portar encima y cómo.

## Lo que hay hoy (`main`)

`app/page.tsx` es un Server Component: llama `api.getPriceSummary()` con `revalidate = 60` (ISR) y
le pasa el resultado a `HomeClient`, que ya es cliente y maneja el estado de provincia.

Composición de la portada, en orden:

```
Navbar (selector de provincia)
  AdBanner horizontal
  StatsBar        ← stats de cabecera (promedio, variación, más barata/cara)
  PriceTable ×N   ← una por marca (YPF, Shell, Axion, Puma)
  AdBanner horizontal
  QuickCompare    ← comparador rápido entre marcas
  MiniTrend       ← sparkline de tendencia
  FuelCalculator  ← calculadora de tanque
  StationMap      ← Leaflet via CDN
  AdBanner ×3 (sidebar)
CommunityReports
Footer
```

Además de los componentes, `main` trajo lo que el rediseño nunca tuvo:

- **Conexión real**: `services/api.ts` con tipos (`PriceSummaryResponse`, `StationDto`,
  `CommunityReportDto`). Nada de `mockPrices` en la ruta principal.
- **SEO completo**: metadata + OpenGraph en `layout.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`,
  `JsonLd.tsx` con datos estructurados.
- **Funcionalidad nueva**: calculadora de tanque, comparador rápido, botón de compartir.

Ese es el piso. **El rediseño se adapta encima de esto, no al revés.**

## Tema visual: los dos que hay

| | Rediseño (`feature/rediseno-frontend`) | `main` (vigente) |
|---|---|---|
| Tipografía | Anton (display) + Archivo (texto) | Inter |
| Fondo claro | `#f3f0e8` (crema) | `surface.50 #fafafa` (gris neutro) |
| Fondo oscuro | `#0e1114` | `dark.bg #111117` |
| Acento | `#ffc400` (amarillo saturado) | `brand.primary #e8a849` (ámbar suave) |
| Suba / baja | `#d43d3d` / `#0e9f5c` con fondos translúcidos | `accent.red #e87171` / `accent.green #5cb07a` |
| Escala de texto | `ink.1..4` + `ink-dark.1..4` | `surface.*` / `dark.*` |
| Colores de marca | `BRAND_COLORS` desde `src/lib/brands.ts` | hardcodeados donde hacen falta |

Son dos sistemas coherentes pero incompatibles: el rediseño es de contraste alto y editorial
(pizarra de precios), el de `main` es pastel y suave. **Hay que elegir uno, no promediarlos.**

### Cómo portar el tema del rediseño, si se decide eso

1. Recuperar `src/lib/brands.ts` (tiene `BRAND_COLORS` y es lo único del rediseño que se importa
   desde `tailwind.config.ts`) y `src/lib/priceUtils.ts`.
2. Reemplazar el bloque `theme.extend.colors` y `fontFamily` de `frontend/tailwind.config.ts` por
   el del rediseño, **sin tocar `content` ni `darkMode`**.
3. Cargar Anton y Archivo desde `layout.tsx` con `next/font/google` — el rediseño las traía por
   `@import` en `globals.css`, y eso ya rompió un build una vez (commit `b822603`). No repetirlo.
4. Recorrer los componentes de `main` cambiando las clases de color. Son ~15 archivos, uno por vez,
   verificando claro y oscuro en cada uno.

Es trabajo de un par de sesiones, y conviene acordarlo con el colaborador antes: el look actual ya
está publicado en producción.

## Mapeo componente por componente

### Del rediseño → dónde vive esa función ahora

| Componente del rediseño | Estado | Qué hacer |
|---|---|---|
| `PriceBoard.tsx` | Reemplazado por `PriceTable.tsx` | `PriceTable` ya recibe `company: CompanySummaryDto` de la API real. Portar el **estilo** de la pizarra, no el componente. |
| `TrendSection.tsx` + `TrendChart.tsx` + `TrendStats.tsx` | Reemplazado por `MiniTrend.tsx` | `MiniTrend` es más chico. Si se quiere la sección completa, se construye sobre `GET /api/prices/trends`, que ya devuelve la serie de 7 días por marca. |
| `Hero.tsx` ("Promedio CABA") | Reemplazado por `StatsBar.tsx` | `StatsBar` ya muestra promedio, variación y extremos desde `stats`. El hero grande del rediseño es una capa visual encima. |
| `Ticker.tsx` | **No existe en `main`** | Es el aporte más rescatable. Se puede portar casi tal cual alimentándolo con `data.companies` en vez de `mockPrices`. Candidato #1. |
| `NewsGrid.tsx` | **No existe en `main`** | No hay fuente de noticias en el backend. Portarlo implica inventar el origen de datos primero. Dejar para después. |
| `lib/priceUtils.ts` | Parcialmente en `priceService` | La API ya devuelve `prevPrice` y `variationPct` calculados. Portar sólo los helpers de formato (moneda, porcentaje), no los de cálculo. |
| `lib/brands.ts` | **No existe en `main`** | Necesario si se porta el tema. Traerlo entero. |
| `data/mockPrices.ts` | Sigue existiendo en `main` | `services/api.ts` importa el tipo `Company` de ahí. No borrarlo sin mover el tipo. |

### Compartidos entre ambas versiones

`AdBanner`, `BrandLogo`, `CommunityReports`, `Footer`, `Navbar`, `StationMap`, `ThemeToggle` existen
en las dos ramas con contenido distinto. **La versión de `main` es la que manda** — está conectada a
la API y al selector de provincia. Del rediseño se toma sólo el tratamiento visual.

`StationMap` en particular: las dos versiones usan el mismo patrón de Leaflet 1.9.4 por CDN dentro
de `useEffect`. No hay conflicto de enfoque, sólo de estilo de los marcadores y del tile layer.

## Orden sugerido para adaptar el rediseño

1. **`Ticker`** — aporta algo que no existe, se conecta a datos que ya están, y es autocontenido.
2. **Helpers de formato** de `priceUtils.ts` — barato, mejora la consistencia de números.
3. **Tema** (`brands.ts` + tailwind + fuentes) — el paso grande. Acordarlo con el colaborador.
4. **Tratamiento visual de `PriceTable` y `StatsBar`** — una vez que el tema esté puesto.
5. **Sección de tendencia completa** sobre `/api/prices/trends`, si se decide que `MiniTrend` queda corto.
6. **`NewsGrid`** — sólo si aparece una fuente real de noticias.

## Reglas que no cambian

- Un componente por archivo en `frontend/src/components/`.
- Todo dato del backend entra por `frontend/src/services/api.ts`. Nada de `fetch` sueltos.
- Iconos de `lucide-react`, colores del tema de Tailwind, nunca hex hardcodeado.
- Leaflet por CDN dentro de `useEffect`, nunca como dependencia npm.
- No romper el SEO de `layout.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts` ni `JsonLd.tsx`.
