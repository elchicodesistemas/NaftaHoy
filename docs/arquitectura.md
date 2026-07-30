# Arquitectura del Sistema — NaftaHoy

## Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                     FUENTES EXTERNAS                            │
│  Shell API  ·  Sec. Energía  ·  Scraping YPF/Axion/Puma        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    APIs REST / Scraping
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    SERVIDOR UBUNTU (VPS)                         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │   Workers    │  │   Backend    │  │    Frontend SSR    │     │
│  │  (Cron Jobs) │  │  (API REST)  │  │   (Next.js/otro)   │     │
│  │             │  │              │  │                    │      │
│  │ - Ingesta   │  │ - /precios   │  │ - Home (precios)   │     │
│  │ - Scraping  │──│ - /historico │──│ - Por petrolera    │     │
│  │ - Normalizr │  │ - /estacion  │  │ - Por zona         │     │
│  └──────┬──────┘  └──────┬───────┘  │ - Históricos       │     │
│         │                │          │ - Comparador        │     │
│         │                │          └────────────────────┘      │
│  ┌──────▼────────────────▼──────┐                               │
│  │        PostgreSQL            │ ← Datos normalizados          │
│  │        Redis                 │ ← Cache de últimos precios    │
│  └──────────────────────────────┘                               │
│                                                                  │
│  Nginx (reverse proxy + SSL) ← Let's Encrypt                    │
└──────────────────────────────────────────────────────────────────┘
                           │
                      NaftaHoy.com
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      USUARIOS                                    │
│  Conductores · Flotas · Medios · Analistas · Desarrolladores    │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes principales

### Workers (Ingesta de datos)
Procesos cron que se ejecutan periódicamente para obtener precios de las fuentes externas, normalizarlos y guardarlos en la base de datos.

### Backend API
API REST interna que expone los datos almacenados. Sirve al frontend y, en el futuro, será la base de la API pública para terceros.

### Frontend SSR
Aplicación web con Server-Side Rendering para SEO óptimo. Consume la API interna y renderiza las páginas con los precios actualizados.

### Base de datos
PostgreSQL como almacenamiento principal (datos históricos, estaciones, precios). Redis como cache para consultas frecuentes y precios "en vivo".

### Nginx
Reverse proxy que maneja SSL, compresión, y distribución de tráfico.

---

## Decisiones técnicas pendientes

- [x] Definir stack exacto (Next.js vs otra opción para frontend) — Next.js 14
- [x] Definir lenguaje del backend (Node.js/TypeScript vs Python vs otro) — Node.js 20 + Express + TypeScript
- [x] Definir ORM (Prisma, Sequelize, SQLAlchemy, etc.) — Drizzle
- [ ] Definir estrategia de deploy (Docker vs instalación directa)
- [ ] Definir herramienta de scraping (Puppeteer vs Cheerio vs otro)
- [ ] Definir dónde vive la Postgres de desarrollo (local vs Neon compartida, como en `LS_Jabones`)

Backend: schema inicial ya escrito en `backend/src/models/schema.ts` (petroleras, estaciones,
precios_actuales, precios_historico, ingesta_runs, usuarios, reportes_precio, reporte_likes).
