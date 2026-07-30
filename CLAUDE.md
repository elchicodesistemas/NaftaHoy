# NAFTAHOY — Contexto para Claude Code

## El proyecto en una línea

Portal de precios de combustibles en tiempo real para Argentina, modelo DolarHoy.com — agrega precios de YPF, Shell, Axion, Puma, PAE por región.

## Estado actual

- **Sitio en producción**: https://naftahoy.com (ya deployado y funcionando)
- **Repo**: https://github.com/elchicodesistemas/NaftaHoy
- **Frontend**: Next.js 14 con componentes esqueleto ya escritos (UI navegable)
- **Backend**: stack sin definir todavía
- **Idioma de trabajo**: español (commits, PRs, docs, comentarios)

## Equipo y división de trabajo

- **Colaborador (otro dev)**: maneja infraestructura, dominio, deploy, VPS, Nginx, Docker
- **Usuario + Claude Code**: frontend (Next.js + Leaflet), backend cuando se defina, documentación

**Claude Code NO toca**:
- Carpeta `infrastructure/`
- Configs de Nginx, Docker, deploy scripts
- Rama `infrastructure` (es del colaborador)
- Variables de entorno de producción

## Stack

### Frontend (`frontend/`)
- Next.js 14 (App Router en `src/app/`)
- TypeScript con strict mode, path alias `@/*` → `frontend/src/*`
- Tailwind 3.4 con tema custom (brand amber, dark palette en `tailwind.config.js`)
- Dark mode por clase: `darkMode: 'class'`
- Iconos: `lucide-react` — no instalar otra librería de íconos
- Mapas: **Leaflet 1.9.4 cargado via CDN dentro de useEffect**, no como dependencia npm. Ver patrón en `frontend/src/components/StationMap.tsx`. Mantener este patrón en componentes nuevos que usen mapas.

### Backend (`backend/`)
- Node.js 20 + Express + TypeScript (stack confirmado 2026-07-29, consistente con el resto del workspace — ver `LS_Jabones/server`)
- **ORM: Drizzle**, dialecto `postgresql`, schema en `backend/src/models/schema.ts`
- Base de datos: PostgreSQL en el servidor del compañero (host `179.43.124.36:5432`, base `naftahoy_prueba`, usuario dedicado `naftahoy_dev` — no root). Connection string real solo en `backend/.env` local (gitignored, hay que recrearlo a mano en cada máquina copiando `backend/.env.example`). Redis para cache de precios "en vivo", según `docs/arquitectura.md` (todavía no implementado)
- Convención de campos: camelCase en TS, snake_case en columnas (Drizzle mapea automático), timestamps siempre `withTimezone: true`
- "Enums" como texto libre con comentario en el schema listando valores válidos, no `pgEnum` nativo — evita `ALTER TYPE` al sumar variantes (mismo criterio que `LS_Jabones`)
- Migraciones: `npm run db:generate` (genera SQL en `backend/drizzle/`) y `npm run db:migrate` (aplica) — nunca editar el SQL generado a mano. `migrations.schema = 'public'` en `drizzle.config.ts` a propósito: `naftahoy_dev` solo tiene (o va a tener) `CREATE` sobre el schema `public`, no sobre la base, así que el tracking de migraciones no puede vivir en un schema `drizzle` aparte
- **Bloqueante actual (2026-07-30):** `naftahoy_dev` todavía no tiene `CREATE` sobre el schema `public` de `naftahoy_prueba` → `npm run db:migrate` falla con "permission denied". Falta que se corra, **conectado específicamente a `naftahoy_prueba`**: `GRANT CREATE ON SCHEMA public TO naftahoy_dev;`. Verificar con `SELECT has_schema_privilege('naftahoy_dev', 'public', 'CREATE');` (tiene que dar `t`). Primer paso al retomar.
- Una vez desbloqueado: `npm run db:migrate` (crea las 8 tablas) y después `npm run db:seed:estaciones -- "<ruta-al-csv>"` (sin `--dry-run`) carga el dataset real de Precios en Surtidor — ya validado con `--dry-run`: 4622 estaciones, 11 petroleras, 18355 precios
- Estado: schema y worker de ingesta ya escritos y tipados (`backend/src/models/schema.ts`, `backend/src/workers/importarSurtidorEnergia.ts`); falta aplicar la migración real (bloqueado por el permiso de arriba), y todavía no hay server Express ni rutas/servicios (`routes/`, `services/` siguen vacías)

### Infraestructura (fuera de alcance)
- Levantada y funcionando, manejada por el colaborador.

## Workflow de git (estricto — leer `CONTRIBUTING.md` para detalles completos)

### Ramas
- `main` = solo releases estables, **conectada a producción (naftahoy.com)**
- `develop` = rama de integración, todo se mergea acá
- `feature/<nombre>` = funcionalidades nuevas (lo que normalmente vamos a usar)
- `hotfix/<nombre>` = fixes urgentes
- `infrastructure` = rama del colaborador, **no tocar**

### Reglas duras
- **NUNCA** push directo a `main` o `develop`
- **NUNCA** force-push
- **NUNCA** `git reset --hard` sin pedir permiso
- **NUNCA** mergear desde Claude — los PRs los revisa y mergea el equipo en GitHub
- **NUNCA** modificar `.gitignore` para incluir archivos sensibles (`.env`, credenciales, `node_modules/`)

### Flujo estándar para Claude
1. Antes de codear: verificar branch actual con `git status`. Si está en `develop` o `main`, crear `feature/<nombre-descriptivo>` con `git checkout -b`.
2. Codear los cambios.
3. Commit con formato fechado (ver abajo).
4. `git push origin feature/<nombre>`.
5. `gh pr create --base develop` con descripción de qué y por qué.
6. Avisar al usuario que el PR está listo para review.

### Formato de commits (obligatorio)
```
[YYYY-MM-DD] tipo: descripción breve en español
```

Tipos válidos:
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

Ejemplo: `[2026-05-07] feature: agregar filtro por marca en PriceTable`

### Estrategia de merge
- "Squash and merge" en GitHub
- Commits atómicos (un cambio lógico por commit)

## Convenciones de código frontend

- Componentes en `frontend/src/components/` (un componente por archivo, `.tsx`)
- Páginas en `frontend/src/app/`
- Reutilizar paleta de Tailwind del tema custom — no hardcodear colores hex
- Reutilizar iconos de `lucide-react`
- Antes de proponer un componente nuevo, revisar los 14 existentes en `frontend/src/components/` por si ya hay algo reutilizable

## Archivos de referencia importantes

- `CONTRIBUTING.md` — detalle completo del workflow de git
- `README.md` — descripción del proyecto
- `NAFTAHOY_Mapa_Proyecto.html` — arquitectura propuesta del proyecto completo
- `frontend/src/components/StationMap.tsx` — patrón de Leaflet via CDN
- `frontend/tailwind.config.js` — tema custom (colores brand)
- `docs/arquitectura.md`, `docs/branching.md`, etc. — documentación adicional
