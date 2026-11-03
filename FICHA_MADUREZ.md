# FICHA DE MADUREZ — NaftaHoy

> Reauditada el **2026-08-28**, después de unificar la rama `feature/rediseno-frontend` con el
> `main` del colaborador. La auditoría anterior (2026-07-30) evaluaba un proyecto que ya no existe:
> el backend Hono + Drizzle se dio de baja entero y la base pasó a ser lo que corre en producción.

---

## 1. Identidad

| | |
|---|---|
| **Nombre** | NaftaHoy |
| **Tipo** | Web app (Next.js) + pipeline de ingesta de datos |
| **Estado** | 🟢 En producción, en desarrollo activo |
| **Nivel actual** | **N2 alcanzado** |
| **Nivel objetivo** | **N3** |
| **Rama de trabajo** | `integracion/unificacion` → PR contra `main` |
| **Última auditoría** | 2026-08-28 |
| **IDE** | Antigravity + Claude Code |
| **Equipo** | 2 personas |

### 1.1 División de responsabilidades

| Área | Responsable |
|---|---|
| VPS, Nginx, Docker, dominio, SSL, deploy | Colaborador |
| Backend Express + Prisma, ingesta oficial | Colaborador (originalmente), compartido de ahora en más |
| Frontend Next.js, Leaflet, UI | Usuario + Claude Code |
| Documentación y gobernanza | Usuario + Claude Code |

⚠️ **La lección de agosto**: durante cuatro semanas ambos construyeron el mismo backend en paralelo
sin saberlo. El colaborador levantó Express + Prisma + ingesta del CSV oficial; el usuario levantó
Hono + Drizzle leyendo una vista. Se perdieron ~25 commits de trabajo real. La causa fue que
`main` y la rama de trabajo nunca se sincronizaron, y que el reparto de responsabilidades escrito
acá decía "el colaborador no toca backend" cuando en los hechos sí lo hacía.

---

## 2. Las cuatro preguntas

### ¿QUÉ es?
Un portal de precios de combustibles para Argentina. Muestra, por marca y por provincia, el precio
de Nafta Súper, Premium, Diesel, Diesel Premium y GNC, con mapa de estaciones, tendencia semanal,
calculadora de tanque y reportes de la comunidad.

### ¿CÓMO funciona?
Un worker programado baja cada 2 horas el CSV oficial de la Secretaría de Energía
(Resolución 314/2016), normaliza marcas y productos, y hace upsert en PostgreSQL vía Prisma.
Una API Express expone resúmenes agregados; el frontend Next.js los consume con ISR de 60 segundos.
Todo corre en un VPS con Docker Compose detrás de Nginx.

### ¿PARA QUÉ sirve?
Para que alguien que va a cargar nafta sepa, en diez segundos, dónde le conviene y cuánto subió
esta semana. Modelo DolarHoy.com: una sola pantalla, cero fricción.

### ¿Cuál es el OBJETIVO?
Ser la referencia de precios de combustible en Argentina, monetizada por publicidad, con datos
oficiales actualizados y complementados por reportes de la comunidad.

---

## 3. Stack — veredicto

| Pieza | Dónde | Veredicto | Por qué |
|---|---|---|---|
| **Next.js 14 App Router** | `frontend/` | ✅ Conservar | Bien usado: Server Component + ISR, SEO completo, sin sobre-ingeniería |
| **Express 4** | `backend/` | ✅ Conservar | Rutas finas, servicios gordos. Aburrido y correcto |
| **Prisma 5** | `backend/` | ✅ Conservar | Schema de 4 modelos con claves únicas bien pensadas; la ingesta es idempotente gracias a eso |
| **PostgreSQL** | VPS | ✅ Conservar | — |
| **node-cron** | `backend/src/workers/` | ✅ Conservar | Suficiente para una tarea cada 2 h. Migrar a un scheduler externo sólo si hay más réplicas |
| **Leaflet por CDN** | `frontend/` | ✅ Conservar | Evita el peso en el bundle; el patrón está documentado |
| **Biome** | raíz + `frontend/` + `backend/` | ✅ Recuperado | Se trajo de la rama vieja; `main` no tenía linter |
| **Docker + Nginx** | `infrastructure/` | ✅ Conservar | Del colaborador, funcionando |
| **Hono + Drizzle** | — | ❌ **Dado de baja** | Implementación paralela del mismo backend. Sobrevive sólo en la rama `feature/rediseno-frontend` como respaldo |
| **Tabla `integradores` + JWT** | — | ❌ Dado de baja | Auth por integrador sobre tablas que nunca se migraron. Si vuelve, se construye sobre los modelos de Prisma |
| **Rate limit en memoria** | `backend/src/utils/` | ⚠️ Provisorio | Deja de servir con más de una réplica |

### Stack definitivo

```
Frontend   Next.js 14 · TypeScript · Tailwind 3.4 · lucide-react · Leaflet (CDN)
Backend    Node 20 · Express 4 · Prisma 5 · PostgreSQL · node-cron · axios + csv-parser
Calidad    Biome · node --test · GitHub Actions
Infra      Docker Compose · Nginx · Let's Encrypt
```

---

## 4. Estado de salud

| Dimensión | Nota | Comentario |
|---|---|---|
| **Funciona end-to-end** | 🟢 | Ingesta → base → API → portada, en producción |
| **Datos reales** | 🟢 | Dataset oficial, actualizado cada 2 h, con traza en `SyncLog` |
| **Deploy reproducible** | 🟢 | Docker Compose validado en CI |
| **Tests** | 🟡 | Un solo archivo, sobre normalización. No hay tests de rutas ni de agregación |
| **Lint / formato** | 🟡 | Biome recién incorporado; falta correr `biome check --write` sobre todo el repo |
| **Documentación** | 🟢 | Reescrita en esta unificación y alineada al código |
| **Observabilidad** | 🔴 | `console.log` y `SyncLog`. Sin métricas, sin alertas, sin agregación de logs |
| **Manejo de secretos** | 🟡 | `.env` en el VPS. Tokens de servicio compartidos, sin rotación |
| **Autenticación** | 🟡 | Dos tokens estáticos. Suficiente hoy, no escala a terceros |
| **Backups** | 🟡 | Scripts escritos (`infrastructure/scripts/`); falta confirmar que corren y que la restauración se probó |
| **Higiene de ramas** | 🔴 | `develop` desfasada 4 meses, 8 ramas remotas vivas, un merge que descartó un árbol entero |
| **Rendimiento** | 🟡 | `getSummary` agrega en memoria; funciona hoy, va a doler con histórico |

---

## 5. Nivel de madurez

### N2 — Producto usable (**alcanzado**)
- ✅ Corre en producción con dominio y SSL
- ✅ Datos reales, no mocks
- ✅ Deploy automatizado y reproducible
- ✅ CI que corre en cada push
- ✅ Documentación alineada al código
- ✅ Secretos fuera del repo

### N3 — Producto mantenible (**objetivo**)
- ⬜ Cobertura de tests sobre las rutas y la agregación de precios
- ⬜ Observabilidad: métricas, alerta sobre `/api/health` y sobre `SyncLog` en `FAILED`
- ⬜ Backups verificados con una restauración real documentada
- ⬜ `develop` resincronizada y política de ramas efectivamente aplicada
- ⬜ Rate limit y caché fuera del proceso (Redis) si aparece una segunda réplica
- ⬜ Rotación de los tokens de servicio

---

## 6. Plan de acción

| # | Acción | Prioridad | Responsable |
|---|---|---|---|
| 1 | Mergear `integracion/unificacion` a `main` vía PR | 🔴 Alta | Ambos |
| 2 | Resincronizar `develop` con `main` y limpiar ramas remotas muertas | 🔴 Alta | Ambos |
| 3 | Acordar por escrito quién toca backend, para que no vuelva a pasar | 🔴 Alta | Ambos |
| 4 | Correr `biome check --write` y commitear el formato en un commit aparte | 🟡 Media | Usuario |
| 5 | Alerta sobre `SyncLog.status = FAILED` y sobre `/api/health` | 🟡 Media | Colaborador |
| 6 | Tests de `priceService.getSummary` con datos sintéticos | 🟡 Media | Usuario |
| 7 | Probar una restauración de backup de punta a punta y documentarla | 🟡 Media | Colaborador |
| 8 | Portar `Ticker` del rediseño sobre `data.companies` | 🟢 Baja | Usuario |
| 9 | Decidir qué tema visual gana y ejecutarlo de una vez | 🟢 Baja | Ambos |

---

## 7. Cómo levantarlo

```bash
# Backend
cd backend
cp .env.example .env          # completar DATABASE_URL, SYNC_API_TOKEN, ADMIN_API_TOKEN
npm install
npm run prisma:generate
npm run prisma:migrate        # primera vez, contra una base propia
npm run dev                   # http://localhost:3001
npm run sync                  # poblar la base sin levantar el server

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

Verificación rápida: `curl http://localhost:3001/api/health` debe devolver `status: ok` con
conteos distintos de cero después del `sync`.

---

## 8. Riesgos y cosas pendientes de definir

- **Dependencia de una sola fuente.** Todo el producto se apoya en un CSV de `datos.energia.gob.ar`.
  Si cambia el formato o se cae el endpoint, la ingesta falla en silencio salvo por `SyncLog`.
  No hay fuente alternativa ni alerta.
- **Marcas fuera del resumen.** El resumen por marca sólo cubre YPF, Shell, Axion y Puma. Las
  estaciones blancas y otras marcas se ingestan pero no aparecen en la portada. Es una decisión de
  producto que conviene hacer explícita.
- **Reportes de la comunidad sin moderador.** Entran como `PENDING` y sólo se aprueban con `curl` y
  un token. Si el sitio crece, la cola se acumula y nadie la mira.
- **Tokens de servicio compartidos.** Sin rotación y sin identidad por consumidor. En cuanto haya
  un tercero integrando, hace falta algo por usuario — construido sobre Prisma, no reviviendo la
  implementación vieja.
- **Tema visual sin decidir.** Hay dos sistemas de diseño terminados y incompatibles. Cuanto más se
  tarde en elegir, más código hay que retocar después.
- **`getSummary` agrega en Node.** Anda hoy; con un año de histórico va a ser el cuello de botella.

---

## 9. Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-04-23 | Estructura base del repo (frontend / backend / infrastructure / docs) |
| 2026-07-29 | Rediseño de frontend con paleta propia y tipografía Anton/Archivo |
| 2026-08-03 | Un solo ORM en el repo (entonces Drizzle) |
| 2026-08-04 | Biome como linter y formateador único; Leaflet queda en `frontend/`, sin `package.json` en la raíz |
| 2026-08-27 | El colaborador publica en `main` el backend Express + Prisma con ingesta oficial y el deploy productivo |
| **2026-08-28** | **`main` es la base. El backend Hono + Drizzle se da de baja sin convivencia. La API del repo es la de Express + Prisma** |
| **2026-08-28** | **Se recupera la gobernanza (CLAUDE.md, esta ficha, `docs/`, `.claude/`) y Biome sobre esa base** |
| **2026-08-28** | **El rediseño de frontend se adapta encima del frontend de `main`, no al revés** |
| **2026-08-28** | **Nunca más un merge con `--strategy=ours` entre historias divergentes** |
