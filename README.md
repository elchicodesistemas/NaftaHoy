# ⛽ NaftaHoy.com

**Portal de precios de combustibles en tiempo real — Argentina**

NaftaHoy es un portal web que centraliza y muestra los precios actualizados de nafta, diésel y GNC de todas las petroleras de Argentina (YPF, Shell, Axion, Puma, PAE, etc.), siguiendo el modelo de [DolarHoy.com](https://dolarhoy.com) aplicado al mercado de combustibles.

---

## Estado del Proyecto

| Item | Detalle |
|------|---------|
| Dominio | `NaftaHoy.com` |
| Servidor | Ubuntu VPS — Dattaweb |
| Fase actual | **Fase 0 — Estructura y planificación** |
| Equipo | 2 desarrolladores |

---

## Estructura del Repositorio

```
NaftaHoy/
├── docs/                    # Documentación del proyecto
│   ├── arquitectura.md      # Arquitectura general del sistema
│   ├── servidor.md          # Configuración e info del servidor
│   ├── fuentes-datos.md     # APIs y fuentes de datos identificadas
│   └── branching.md         # Estrategia de ramas y workflow
│
├── backend/                 # API y lógica del servidor (por definir stack)
│   ├── src/
│   │   ├── config/          # Configuraciones (DB, APIs externas, etc.)
│   │   ├── services/        # Lógica de negocio y servicios
│   │   ├── workers/         # Cron jobs e ingesta de datos
│   │   ├── routes/          # Endpoints de la API REST
│   │   ├── models/          # Modelos de base de datos
│   │   └── utils/           # Utilidades compartidas
│   └── tests/               # Tests del backend
│
├── frontend/                # Aplicación web (por definir stack)
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas del sitio
│   │   ├── styles/          # Estilos globales
│   │   └── assets/          # Imágenes, íconos, fuentes
│   └── public/              # Archivos estáticos
│
├── infrastructure/          # Configuración del servidor y deploy
│   ├── docker/              # Dockerfiles y docker-compose
│   ├── nginx/               # Configuración de Nginx
│   └── scripts/             # Scripts de deploy y mantenimiento
│
├── .github/                 # Configuración de GitHub
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/           # GitHub Actions (CI/CD futuro)
│
├── .gitignore
├── CONTRIBUTING.md           # Guía de contribución y workflow
└── README.md                 # Este archivo
```

---

## Ramas del Repositorio

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable. Solo se mergea desde `develop` cuando hay release |
| `develop` | Rama de integración. Todo el desarrollo se mergea acá primero |
| `infrastructure` | Configuración del servidor, Docker, Nginx, deploy scripts |
| `feature/*` | Ramas para funcionalidades nuevas (ej: `feature/ingesta-shell-api`) |
| `hotfix/*` | Correcciones urgentes en producción |

---

## Fuentes de Datos

- **Shell Developer Portal** — PriceList API (developer.shell.com)
- **Secretaría de Energía** — Datos abiertos (datos.energia.gob.ar)
- **Precios en Surtidor** — Datos oficiales del gobierno
- **Datos.gob.ar** — Históricos de precios

Ver detalle completo en [`docs/fuentes-datos.md`](docs/fuentes-datos.md)

---

## Convención de Commits

Los commits siguen el formato con fecha:

```
[YYYY-MM-DD] tipo: descripción breve

Detalle opcional de los cambios realizados.
```

**Tipos válidos:**
- `estructura` — Cambios en la organización del proyecto
- `feature` — Nueva funcionalidad
- `fix` — Corrección de errores
- `docs` — Documentación
- `infra` — Infraestructura y configuración de servidor
- `refactor` — Refactorización de código
- `test` — Tests

**Ejemplo:**
```
[2026-04-23] estructura: Inicialización del repositorio con estructura base
```

---

## Cómo Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para la guía completa del workflow de desarrollo.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
