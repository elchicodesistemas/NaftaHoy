# Fuentes de Datos — NaftaHoy

## Fuentes Confirmadas

### 1. Shell Developer Portal — PriceList API
- **URL:** https://developer.shell.com/api-catalog
- **Tipo:** API REST oficial
- **Datos:** Precios en surtidor de estaciones Shell y sitios asociados. Incluye descuentos.
- **Acceso:** Requiere registro como developer partner y API key
- **Estado:** ✅ Disponible
- **Prioridad:** Alta
- **Acción:** Registrarse en el portal y obtener credenciales

### 2. Secretaría de Energía — Datos Abiertos
- **URL:** http://datos.energia.gob.ar
- **Tipo:** Portal de datos abiertos
- **Datos:** Precios declarados por estaciones de servicio (Resolución 314/2016). Las EESS deben declarar dentro de 8hs de cualquier cambio.
- **Acceso:** Público y gratuito
- **Estado:** ✅ Disponible
- **Prioridad:** Crítica (fuente más completa)
- **Acción:** Analizar estructura de datasets y formatos disponibles

### 3. Precios en Surtidor — Mapa Web del Gobierno
- **URL:** https://preciosensurtidor.energia.gob.ar
- **Tipo:** Aplicación web con mapa interactivo
- **Datos:** Precios actualizados por estación, geolocalización
- **Acceso:** Público (no tiene API, requiere scraping)
- **Scraper disponible:** https://github.com/andytow/surtidores (open source)
- **Estado:** ✅ Funcional
- **Prioridad:** Alta
- **Acción:** Probar el scraper existente y adaptarlo

### 4. Datos.gob.ar — Datasets Históricos
- **URL:** https://datos.gob.ar/dataset/energia-precios-surtidor---resolucion-3142016
- **Tipo:** CSV descargable
- **Datos:** Series históricas de precios de combustibles por estación
- **Acceso:** Público y gratuito
- **Estado:** ✅ Disponible
- **Prioridad:** Media (para gráficos históricos)
- **Acción:** Descargar y analizar estructura del CSV

---

## Fuentes por Investigar

### 5. YPF
- **Web:** https://www.ypf.com
- **Tipo:** Por determinar (scraping probable)
- **Datos:** Precios oficiales YPF por estación y zona
- **Estado:** 🔍 Pendiente de análisis
- **Acción:** Inspeccionar la web, buscar endpoints internos que usen para mostrar precios

### 6. Axion Energy
- **Web:** https://www.axionenergy.com
- **Tipo:** Por determinar
- **Estado:** 🔍 Pendiente de análisis

### 7. Puma Energy
- **Web:** https://www.pumaenergy.com
- **Tipo:** Por determinar
- **Estado:** 🔍 Pendiente de análisis

### 8. PAE (Pan American Energy)
- **Web:** https://www.pan-american-energy.com
- **Tipo:** Por determinar
- **Estado:** 🔍 Pendiente de análisis

---

## Estrategia de Ingesta de Datos

```
Fuente API oficial → Consumir directamente via HTTP (preferido)
Fuente sin API     → Scraping controlado con Puppeteer/Cheerio
Datos históricos   → Descarga batch de CSVs

Frecuencia: Cron job cada 1-4 horas (las EESS declaran dentro de 8hs)
Almacenamiento: PostgreSQL (datos normalizados) + Redis (cache de últimos precios)
```

## Formato Unificado de Datos (propuesta)

```json
{
  "estacion_id": "shell-caba-001",
  "petrolera": "Shell",
  "direccion": "Av. Libertador 1234, CABA",
  "localidad": "CABA",
  "provincia": "Buenos Aires",
  "latitud": -34.5678,
  "longitud": -58.4321,
  "precios": {
    "nafta_super": 1999.00,
    "nafta_premium": 2299.00,
    "diesel_comun": 1899.00,
    "diesel_premium": 2199.00,
    "gnc": 450.00
  },
  "moneda": "ARS",
  "fecha_actualizacion": "2026-04-23T14:30:00-03:00",
  "fuente": "shell-api"
}
```
