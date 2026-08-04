# FICHA DE MADUREZ — NaftaHoy

> Documento de contexto del proyecto. Lo leen tanto **Claude Code** (dentro de Antigravity)
> como el **agente del Esquema de trabajo**. Si algo cambia acá, cambia para los dos.
>
> Reglas del sistema: `../../CLAUDE.md` · Stack: `../../_sistema/00-stack-oficial.md` · Niveles: `../../_sistema/02-niveles-madurez.md`

---

## 1. Identidad

| Campo | Valor |
|---|---|
| **Nombre** | NaftaHoy |
| **Tipo** | Web app (Next.js) + pipeline de ingesta de datos |
| **Estado** | 🚧 En desarrollo |
| **Nivel actual** | **N1 incompleto** |
| **Nivel objetivo** | **N2** |
| **Rama de trabajo** | `feature/rediseno-frontend` |
| **Última auditoría** | 2026-07-30 |
| **IDE** | Antigravity + Claude Code |
| **Equipo** | **2 personas** — ver sección 1.1 |

### 1.1 División de responsabilidades ⚠️

Este proyecto **no es de una sola persona**. Se arrancó con un compañero de trabajo del área de IT.

| Área | Responsable |
|---|---|
| Hosting, servidor, dominio, disponibilidad de la base | **Compañero de IT** |
| Aplicación: frontend, backend, schema, ingesta, producto | **Compadrito** |

**Consecuencias prácticas — esto cambia varias cosas del plan:**

- `infrastructure/` (docker, nginx, scripts), `docs/servidor.md` y `docs/guia-deploy.md` son
  **territorio del compañero**. No se tocan ni se declaran "ruido" sin hablarlo con él.
- **Migrar a pnpm (paso 4) puede romper su deploy** si los scripts del servidor asumen `npm install`.
  Deja de ser riesgo bajo.
- **Agregar CI con deploy automático (paso 6) toca su infraestructura.** Requiere acuerdo previo.
- **Borrar ramas remotas (paso 7) es destructivo para otro.** `Dev` y `develop` pueden estar
  duplicadas porque las usa él. Nunca borrar sin preguntar.
- `next` está pineado en `14.2.25` por un fix de build **en su servidor**. Antes de subir a Next 15
  hay que confirmar con él que el entorno lo soporta.
- **Backups y credenciales de producción** los maneja él. El checklist de N3 no se puede completar
  en solitario.
- Las convenciones (Conventional Commits, modelo de ramas) ahora se **acuerdan entre dos**,
  no se deciden unilateralmente.

---

## 2. Las cuatro preguntas

### ¿QUÉ es?

Un comparador de precios de combustible en Argentina. Mostrás en un mapa y en una pizarra cuánto
cuesta la nafta en cada estación cerca tuyo, y los usuarios pueden reportar precios que ven.

### ¿CÓMO funciona?

El recorrido de un precio, **tal como está diseñado** (todavía no funciona entero):

```
Fuentes externas          →  Worker de ingesta   →  Postgres            →  API      →  Frontend
(datos abiertos de           importarSurtidor       precios_actuales       ❌ NO      mapa +
 Energía, API de Shell,      Energia.ts             + precios_historico    EXISTE     pizarra +
 scraping YPF/Axion/Puma)                           + estaciones                      tendencia
```

**Dónde se corta hoy:** entre Postgres y el frontend no hay nada. El frontend lee de
`src/data/mockPrices.ts` y de 8 estaciones escritas a mano dentro de `StationMap.tsx`.

### ¿PARA QUÉ sirve?

Para que alguien que está por cargar combustible sepa dónde le sale más barato sin recorrer la ciudad.
En un país con inflación alta, la diferencia entre estaciones es plata real.

### ¿Cuál es el OBJETIVO?

- **A 1 mes:** <!-- COMPLETAR — propuesta: cerrar N2 y que el mapa muestre datos reales de CABA -->
- **A 6 meses:** <!-- COMPLETAR -->
- **Ambición máxima:** <!-- COMPLETAR -->

---

## 3. Stack — veredicto de la auditoría

| Tecnología | Dónde se usa | Veredicto | Por qué |
|---|---|---|---|
| TypeScript | Todo el proyecto | ✅ **Conservar** | Es el único lenguaje del proyecto. No hay nada que unificar. |
| Next.js 14.2.25 | `frontend/` | ✅ Conservar | Pineado por un fix viejo de build. Subir a 15 después de cerrar N2, no antes. |
| React 18 | `frontend/` | ✅ Conservar | — |
| Tailwind 3 + lucide-react | `frontend/` | ✅ Conservar | Coincide con el stack oficial. |
| PostgreSQL | `backend/` | ✅ Conservar | — |
| **Drizzle ORM** | `backend/` | ✅ **Conservar** | Schema sólido de 7 tablas, con migraciones ya generadas. Es el mejor código del repo. |
| ~~Prisma~~ | ~~`frontend/prisma/`~~ | ✅ Sacado (paso 2) | Duplicaba el modelo de datos y usaba `Float` para el precio. Nadie lo importaba. |
| npm | `frontend/package.json`, `backend/package.json` | ❌ Sacar | El estándar de la carpeta es **pnpm** — pendiente paso 4 (coordinar con IT). |
| Express | — | ❌ Sacar | Se menciona en un commit pero no está instalado. Si hace falta API → **Hono**. |
| Leaflet vía CDN | `StationMap.tsx` | ⚠️ Revisar | Funciona, pero sin tipos y con HTML por concatenación. Pendiente paso 10. |
| leaflet + @types/leaflet | `frontend/package.json` | ✅ Movido (paso 3) | Ya no viven en un `package.json` huérfano en la raíz. El JS real se sigue cargando por CDN (patrón intencional, ver `CLAUDE.md`); estas declaraciones son solo para tipos/consistencia. |
| react-leaflet | — | ✅ Sacado (paso 3) | No se usaba, y v5 requiere React 19 — incompatible con el React 18 pineado. Ni siquiera instalaba. |
| Biome | raíz + `frontend/` + `backend/` | ✅ **Agregado (paso 5)** | Un solo linter + formateador para todo el proyecto. Cierra N1. |

### Stack definitivo

> **TypeScript · Next.js · Tailwind · PostgreSQL + Drizzle · pnpm workspaces**

Una sola fuente de verdad del modelo de datos: `backend/src/models/schema.ts`.

---

## 4. Estado de salud

```
🔴 CRÍTICO   — No existe la API. backend/src/routes, /services y /utils están vacíos (.gitkeep).
               backend/package.json ni siquiera tiene un script `dev` o `start`:
               el backend no se puede levantar.

🟡 MEJORABLE — Dos package.json y dos package-lock.json (frontend, backend), todos con npm.
               Pendiente unificar en pnpm workspaces (paso 4, coordinar con IT).
🟡 MEJORABLE — .github/workflows/ existe pero está vacío. No hay CI.
🟡 MEJORABLE — Sin tests. backend/tests/ solo tiene .gitkeep.
🟡 MEJORABLE — Ramas `Dev` y `develop` duplicadas en el remoto (distinta capitalización → rompe en Windows).
               7 ramas locales y 8 remotas para un proyecto de una persona.
🟡 MEJORABLE — Leaflet se carga por CDN y se lee con (window as any).L → cero tipos en el
               componente más complejo. Los marcadores se arman concatenando HTML en strings:
               riesgo de XSS cuando los nombres de estación vengan de la base. (Paso 10 — Biome
               ya marca los 6 `noExplicitAny` de StationMap.tsx como warning, a propósito no tocados.)
🟡 MEJORABLE — infrastructure/ son cuatro carpetas vacías con .gitkeep.

🟢 SANO      — Una sola fuente de verdad del modelo de datos: Drizzle. Prisma eliminado (paso 2).
🟢 SANO      — Linter y formateador configurados: Biome en raíz + frontend + backend (paso 5).
🟢 SANO      — Diseño de la base de datos. 7 tablas con decisiones justificadas en comentarios,
               índices pensados para las consultas reales, unique constraints para upsert idempotente.
🟢 SANO      — Manejo de secretos. Nunca se commiteó un .env (verificado en el historial completo).
               La captura de infrastructure/ está ignorada y no trackeada.
🟢 SANO      — TypeScript strict: true en los dos tsconfig.
🟢 SANO      — db.ts valida DATABASE_URL al arrancar y falla con mensaje claro.
🟢 SANO      — Documentación real en docs/ (arquitectura, fuentes-datos, backend-funcional,
               frontend-funcional, guia-deploy, servidor, branching).
🟢 SANO      — Frontend visualmente terminado y coherente.
```

---

## 5. Nivel de madurez

### N1 — MVP ordenado (estado actual)

- [x] Repo en GitHub
- [x] `.gitignore` correcto
- [x] `.env.example` (backend) — ⚠️ falta el del frontend
- [x] Cero secretos en el código y en el historial
- [x] Estructura de carpetas coherente
- [x] `README.md`
- [ ] **Un solo gestor de paquetes con lockfile** ← falta (paso 4, requiere coordinar con IT)
- [x] **Formateador y linter configurados** — Biome (paso 5, 2026-08-04)

**Falta un ítem para cerrar N1:** migrar a pnpm workspaces. Requiere acuerdo previo con IT
porque puede romper su script de deploy (ver 1.1).

### N2 — Producto usable (objetivo)

- [x] TypeScript strict
- [ ] Tests del camino feliz de lo crítico
- [ ] CI en GitHub Actions (lint + typecheck + tests)
- [ ] Deploy automático desde `main`
- [x] Variables de entorno validadas al arrancar (backend)
- [ ] Manejo de errores explícito en la ingesta
- [ ] Logging básico estructurado

---

## 6. Plan de acción

Ordenado por **riesgo bajo primero**. Los pasos 1 a 6 no tocan nada de lo que se ve en pantalla.

| # | Paso | Qué se gana | Riesgo | Tiempo |
|---|---|---|---|---|
| 1 | ✅ ~~Commitear o stashear los 20+ archivos pendientes~~ | No perder trabajo | bajo | 5 min |
| 2 | ✅ ~~Borrar `frontend/prisma/`~~ | Una sola fuente de verdad del dato | bajo | 10 min |
| 3 | ✅ ~~Mover Leaflet al `package.json` del frontend y eliminar el de la raíz~~ | Deja de haber un paquete huérfano | bajo | 20 min |
| 4 | Migrar a **pnpm workspaces** — 🤝 **coordinar con IT** | Un solo lockfile, un solo gestor | **medio** | 1 h |
| 5 | ✅ ~~Configurar **Biome** (lint + formato en una herramienta)~~ | **Cierra N1** | bajo | 45 min |
| 6 | CI en GitHub Actions: lint + typecheck — 🤝 **coordinar si incluye deploy** | Red de seguridad antes de escribir código nuevo | bajo* | 45 min |
| 7 | Limpiar ramas · resolver `Dev` vs `develop` — 🤝 **NO borrar nada sin preguntar** | Historial navegable | **alto** | 30 min |
| 8 | **Construir la API** (Hono sobre el schema existente) | Desbloquea el producto | medio | varias sesiones |
| 9 | Conectar el frontend a datos reales (reemplazar `mockPrices.ts`) | El producto empieza a existir | medio | — |
| 10 | Refactor del mapa (tipos + sacar el HTML por strings) | Seguridad y mantenibilidad | medio | — |

**Regla:** una cosa por vez. Terminar un paso, verificarlo, y recién ahí seguir.

---

## 7. Cómo levantarlo

```bash
# Frontend — funciona hoy (con datos falsos)
cd frontend
npm install
npm run dev            # http://localhost:3000

# Backend — NO se puede levantar todavía: no hay script dev/start.
# Lo único ejecutable hoy:
cd backend
npm install
cp .env.example .env   # completar DATABASE_URL
npm run db:migrate     # aplicar migraciones
npm run db:studio      # inspeccionar la base
npm run db:seed:estaciones
```

> Al terminar el paso 4 del plan, todo esto pasa a `pnpm` desde la raíz.

---

## 8. Riesgos y cosas pendientes de definir

- **La API es el cuello de botella.** Todo lo visual está listo y no sirve de nada hasta que exista.
- **Las fuentes de datos son inestables.** Según `docs/fuentes-datos.md`, YPF, Axion y Puma no tienen
  API oficial: hay scraping. El scraping se rompe solo cuando la web de origen cambia. La tabla
  `ingesta_runs` ya está pensada para detectarlo, pero nadie la está mirando todavía.
- **Legal:** hay que revisar si publicar precios scrapeados de esas empresas tiene alguna restricción
  de términos de uso. No es una pregunta técnica y conviene resolverla antes de escalar.
- **Auth propia.** El schema tiene `usuarios.passwordHash`. El estándar de la carpeta dice
  **no escribir auth casera**. Antes de implementar el login, decidir: Better Auth, Supabase Auth o Clerk.
- **`AdBanner.tsx`** sugiere monetización con publicidad. Sin definir.

---

## 9. Decisiones tomadas

| Fecha | Decisión | Estado |
|---|---|---|
| 2026-07-30 | Drizzle es el único ORM. Prisma se elimina. | ✅ ejecutado 2026-08-04 (paso 2) |
| 2026-07-30 | pnpm workspaces como estructura de paquetes. | ⏳ pendiente (paso 4) |
| 2026-07-30 | Si hace falta API separada → Hono, no Express. | ⏳ pendiente (paso 8) |
| 2026-08-04 | react-leaflet se descarta (no se usaba; v5 requiere React 19, incompatible con React 18 pineado). leaflet + @types/leaflet se conservan en frontend/package.json. | ✅ ejecutado (paso 3) |
| 2026-08-04 | Biome como linter + formateador único, con `biome.json` raíz y configs anidados via `extends: "//"`. `backend/drizzle/` excluido (archivos generados). | ✅ ejecutado (paso 5) |

> Las decisiones que cambien el rumbo se anotan también en `../../_registro/BITACORA.md`.
> Las que ameriten justificación larga van como ADR en `docs/adr/` (plantilla en `../../_plantillas/ADR.md`).
