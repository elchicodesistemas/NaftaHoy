# Documentación funcional — Frontend (rediseño `feature/rediseno-frontend`)

Análisis de la UI que hoy corre con datos mock (`frontend/src/data/mockPrices.ts`), sección por
sección, para poder cruzarla con el esquema real de `backend/src/models/schema.ts` y definir el
contrato de datos único. No cubre estilos ni layout — solo **qué información necesita cada pieza**.

## 1. Objetivo del sitio

Portal tipo DolarHoy pero para combustibles: mostrar, en una sola home, el precio vigente de
nafta/diésel/GNC por petrolera, compararlos entre sí, ubicarlos en un mapa y dejar que la
comunidad reporte precios cuando la fuente oficial no alcanza. Todo en una landing con scroll,
sin páginas internas todavía (los links "Comparador / Histórico / Por zona / API" del footer
apuntan a `#`, no existen como rutas).

## 2. Orden real de la página (`app/page.tsx`)

`Ticker → Navbar → Hero → [Ad] → PriceBoard → [Ad] → TrendSection → [Ad] → StationMap →
[Ad] → NewsGrid → CommunityReports (drawer flotante) → Footer`

## 3. `<head>` / metadata (`app/layout.tsx`)

| Campo | Valor actual | Fuente de datos que falta |
|---|---|---|
| `title` / `description` | Fijos, genéricos ("Consultá los precios...") | Podría volverse dinámico si hay precio destacado del día |
| `keywords` | Lista fija de marcas | — |
| `openGraph` | `url: naftahoy.com`, sin imagen (`og:image`) | Falta definir imagen social |
| `lang` | `es` | — |

No hay `sitemap.xml`, `robots.txt` ni structured data (`FuelPrice`/`Product` schema.org) todavía —
relevante para SEO cuando haya rutas por zona/petrolera.

## 4. Secciones, sección por sección

### 4.1 Ticker (cinta superior)
- **Qué es**: marquesina infinita con precio + variación % de los primeros dos combustibles de
  cada petrolera.
- **Datos por ítem**: `petrolera.id` (color), `nombre corto`, `tipo de combustible`, `precio`,
  `% variación` (calculado como `(precio - precioAnterior) / precioAnterior`).
- **Requiere del backend**: precio actual **y** precio anterior por combustible — hoy
  `prevPrice` es un campo mock plano; en el schema real esto sale de comparar contra
  `precios_historico` (el registro previo a `fechaVigencia` actual), no existe como columna.

### 4.2 Navbar
- Logo + nombre fijos. Links de anchor (`#pizarra`, `#tendencia`, `#mapa`, `#noticias`) — no son
  datos, son navegación interna.
- Badge "EN VIVO" fijo (sin lógica de conexión real a un stream/socket).
- Toggle de tema (dark/light) vía `localStorage`, sin dato de servidor.

### 4.3 Hero
- **Qué es**: título + promedio de precios "de hoy" para CABA.
- **Datos**: fecha actual (cliente), región fija (`"CABA y GBA"` **hardcodeado**, no hay
  selector de provincia/localidad todavía), y 4 promedios: Súper, Premium, Diesel, GNC —
  calculados como promedio simple entre las 4 petroleras mock.
- **Gap**: el backend ya modela `provincia`/`localidad` por estación
  (`estaciones.provincia`, `estaciones.localidad`); el frontend no tiene aún ningún selector de
  zona — el promedio "de hoy" necesita definirse como: ¿promedio por provincia? ¿por todas las
  estaciones activas? ¿por petrolera y luego promedio entre petroleras (como ahora)?

### 4.4 PriceBoard ("La pizarra") — sección núcleo
- **Qué es**: tabla comparativa por petrolera, ordenada de más barata a más cara (Súper).
- **Columnas y datos por fila**:
  | Columna | Campo | Origen actual |
  |---|---|---|
  | Petrolera | `nombre` completo (ej. "Axion Energy") + color de marca + logo | `Company.name` |
  | Súper | `precio` | `fuels[0]` |
  | Premium | `precio` | `fuels[1]` |
  | Diesel | `precio` | `fuels[2]` |
  | Variación | `%` sobre Súper únicamente | `getVariacionPct(fuels[0])` |
- Badge "MÁS BARATA HOY" = la primera fila tras ordenar.
- Footer de texto: diferencia en $ entre la más cara y la más barata (litro y tanque de 50L).
- **Gap importante**: la tabla es **por petrolera (agregado nacional)**, no por estación
  concreta ni por provincia — el backend en cambio guarda precio por `estacion_id` +
  `tipo_combustible`. Hay que decidir si "La pizarra" muestra precio promedio de la petrolera,
  precio de una estación de referencia, o se vuelve filtrable por provincia/localidad.
- Solo se muestran 3 combustibles (Súper/Premium/Diesel) de los 5 que trae cada compañía mock
  (falta GNC en la tabla, sí aparece en Ticker/Hero).

### 4.5 TrendSection → TrendChart + TrendStats
- **TrendChart**: gráfico de línea SVG a mano (sin librería) de **7 días, un solo combustible
  (Nafta Súper), una sola petrolera (YPF, hardcodeada)**. Eje X = `weeklyTrend[].day`, Y =
  `weeklyTrend[].ypf`.
  - **Gap**: no es seleccionable por petrolera ni por combustible todavía; el dato real vendría
    de `precios_historico` filtrado por `tipo_combustible = 'nafta_super'` y una petrolera
    (o promedio) agrupado por día.
- **TrendStats**: dos tarjetas.
  - "Ahorro posible hoy" = spread ($ más cara − $ más barata) × 50 litros — se deriva de los
    mismos datos que PriceBoard, no necesita fuente nueva.
  - "Próximo ajuste estimado" = **placeholder editorial fijo** ("Agosto"), literalmente marcado
    `TODO` en el código: *"sin fuente de datos todavía"*. No hay tabla en el backend para esto
    (sería un dato editorial/manual, no de ingesta).

### 4.6 StationMap ("¿Dónde cargo más barato?")
- **Qué es**: mapa Leaflet (CDN) centrado en CABA, con 8 estaciones **hardcodeadas en el
  componente** (no vienen de `data/mockPrices.ts`).
- **Datos por estación**: `nombre` (con dirección incluida en el string), `brand`, `lat`, `lng`.
  El precio mostrado en el pin/popup es el de **Nafta Súper de la petrolera**, no un precio de
  estación real (`priceFor(brand)` busca en `companies`, no en la estación).
- Filtro por marca (chips: Todas/YPF/Shell/Axion/Puma) — el `<select>` de marcas está limitado
  a esas 4, igual que `BRAND_COLORS`/`BrandLogo`.
- Botón "Mi ubicación" usa `navigator.geolocation`, sin relación con backend.
- **Gap crítico de escala**: el backend ya sembró (o va a sembrar) ~4622 estaciones reales de 11
  petroleras (`docs/arquitectura.md`, dataset Precios en Surtidor). El componente actual no
  tiene paginación, clustering ni carga por bounding box — con miles de marcadores hay que
  resolver esto antes de conectar datos reales (cluster de Leaflet o fetch por viewport).
- **Gap de marcas**: solo 4 petroleras soportadas en frontend (`BrandId`) vs. 11 reales en el
  dataset del backend (falta al menos PAE, mencionada en el README del proyecto). Hay que
  ampliar `BRAND_COLORS`, `BRAND_TEXT_ON`, `BrandLogo` y los filtros a la lista completa antes de
  conectar.

### 4.7 NewsGrid ("Últimas noticias")
- 4 tarjetas **100% hardcodeadas** en el componente (`tag` tipo "HACE 3 HORAS", `title`).
- No hay modelo de datos ni tabla en el backend para noticias — es contenido editorial. Si se
  quiere real, hace falta definir: fuente (¿manual/CMS?, ¿scraping de gacetillas de precios?),
  campos (`título`, `fecha/antigüedad`, `link`, ¿`petrolera` relacionada?).

### 4.8 CommunityReports (drawer flotante — la "etiqueta de reportes")
- **Qué es**: botón flotante lateral derecho ("Reportes", con contador) que abre un panel con
  reportes de precios cargados por usuarios + un mini-formulario para reportar uno nuevo.
- **Datos por reporte** (`Report`):
  | Campo | Tipo | Mapeo a `reportes_precio` (backend) |
  |---|---|---|
  | `user` | string ("Carlos M.") | vendría de `usuarios.nombre`, hoy sin mostrar apellido completo (privacidad) |
  | `region` | string libre ("CABA - Palermo") | `reportesPrecio.region` — **ya coincide 1:1** |
  | `brand` | `BrandId` | `reportesPrecio.petroleraId` → resolver a slug |
  | `what` | string ("YPF — Nafta Súper") | combinación de petrolera + `tipoCombustible` |
  | `price` | number | `reportesPrecio.precioReportado` |
  | `time` | string relativo ("Hace 15 min") | derivado de `createdAt` |
  | `likes` | number | `COUNT(*)` sobre `reporte_likes` — el backend ya lo modela como tabla M:N, no columna, hay que calcularlo en el endpoint |
- **Formulario de reporte** (mini form al pie del drawer): `estación` (hoy es un `<select>` de
  **marca**, no de estación puntual — mal etiquetado, debería ser petrolera o rediseñarse para
  elegir estación real) + `precio` (input number). No pide combustible ni región — inconsistente
  con los datos que sí se muestran en la lista.
- Texto fijo: *"Solo usuarios verificados pueden reportar precios"* → confirma que el flujo
  necesita auth (el backend ya tiene `usuarios.verificado` boolean para esto).
- **Gap**: no hay combustible ni región en el form aunque el modelo los requiere (`NOT NULL` en
  `reportesPrecio.tipoCombustible` y `.region`). Falta completar el formulario o definir defaults.

### 4.9 Footer
- Logo + 4 links (`Comparador`, `Histórico`, `Por zona`, `API`) que hoy son anchors muertos
  (`href="#"`) — son la hoja de ruta de páginas futuras, no datos.
- Texto legal fijo con el año (`© 2026`) y disclaimer de precios informativos.

## 5. Modelo de datos que el frontend necesita "tal cual" hoy (resumen consolidado)

| Entidad | Campos usados por la UI | Dónde se usa |
|---|---|---|
| **Petrolera** | `id/slug`, `nombre`, `nombre corto`, color de marca, logo | Ticker, PriceBoard, StationMap, CommunityReports |
| **Precio actual** | `tipoCombustible`, `precio`, `precioAnterior` (para %) | Ticker, Hero, PriceBoard, TrendStats |
| **Precio histórico** | serie diaria por combustible+petrolera (7 días) | TrendChart |
| **Estación** | `nombre`, `dirección`, `lat`, `lng`, `petrolera`, `provincia/localidad` (aún no usado en UI) | StationMap |
| **Reporte comunitario** | `usuario`, `región`, `petrolera`, `combustible`, `precio`, `fecha`, `likes` | CommunityReports |
| **Noticia** | `tag`/antigüedad, `título`, (¿link?) | NewsGrid |
| **Ajuste estimado** (editorial) | mes/fecha estimada + motivo | TrendStats — sin tabla, sin fuente definida |

## 6. Brechas a resolver antes de unificar frontend ↔ backend

1. **Marcas soportadas**: frontend hardcodea 4 (`ypf`, `shell`, `axion`, `puma`); backend/dataset
   real trae 11 petroleras. Hay que generalizar `BRAND_COLORS`/`BRAND_TEXT_ON`/`BrandLogo`/filtros
   a data-driven (probablemente un campo `color` en la tabla `petroleras` en vez de un mapa fijo
   en el frontend).
2. **Nivel de agregación de "La pizarra" y "Promedio CABA"**: hoy es promedio nacional simulado
   por petrolera; el dato real vive por estación. Definir si se agrega por provincia, por
   localidad, o se deja una estación "de referencia" por petrolera y zona.
3. **Variación %**: necesita "precio anterior" — no es un campo, se calcula comparando contra el
   registro previo en `precios_historico` (o guardando el previo en `precios_actuales` al hacer
   upsert).
4. **Mapa sin paginar**: 8 puntos hardcodeados hoy vs. miles reales — falta estrategia de carga
   (clustering / fetch por bounding box / límite por zoom).
5. **Noticias**: sin modelo en backend, contenido 100% editorial — decidir si se arma un CMS
   simple, tabla nueva, o se descarta la sección en el MVP.
6. **"Próximo ajuste estimado"**: placeholder editorial explícito en el código, sin fuente de
   datos ni tabla — mismo tratamiento que noticias (editorial) o se elimina.
7. **Formulario de reporte incompleto**: falta combustible y región como inputs reales aunque el
   backend los exige `NOT NULL`; y el `<select>` dice "Estación" pero lista marcas.
8. **Auth de reportes**: la UI ya asume "usuarios verificados"; el backend tiene
   `usuarios.verificado` pero no hay rutas/JWT todavía (consistente con lo que dice
   `CLAUDE.md`: `routes/` y `services/` siguen vacías).
9. **Selector de zona/provincia**: no existe en ningún componente hoy, pero el schema del backend
   ya está preparado (`estaciones.provincia`, `.localidad`) — es la pieza que falta en el
   frontend para que "CABA y GBA" deje de estar fijo en el Hero.
