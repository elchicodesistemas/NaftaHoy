# Guía de Contribución — NaftaHoy

## Workflow de Desarrollo

### 1. Ramas principales

```
main ← Solo releases estables (producción)
  │
  └── develop ← Rama de integración (todo se mergea acá)
        │
        ├── feature/nombre-feature ← Funcionalidades nuevas
        ├── infrastructure ← Config de servidor/deploy
        └── hotfix/nombre-fix ← Correcciones urgentes
```

### 2. Flujo de trabajo para nuevas funcionalidades

```bash
# 1. Asegurate de estar en develop y actualizado
git checkout develop
git pull origin develop

# 2. Creá tu rama de feature
git checkout -b feature/nombre-descriptivo

# 3. Trabajá y hacé commits con fecha
git add .
git commit -m "[2026-04-23] feature: descripción del cambio"

# 4. Subí tu rama
git push origin feature/nombre-descriptivo

# 5. Creá un Pull Request en GitHub: feature/... → develop
```

### 3. Flujo para cambios de infraestructura

```bash
# Cambios en servidor, Docker, Nginx, scripts de deploy
git checkout infrastructure
git pull origin infrastructure
# ... hacé los cambios ...
git commit -m "[2026-04-23] infra: descripción del cambio"
git push origin infrastructure

# Cuando esté listo, PR: infrastructure → develop
```

### 4. Convención de commits

Formato obligatorio:

```
[YYYY-MM-DD] tipo: descripción breve en español
```

| Tipo | Uso |
|------|-----|
| `estructura` | Organización de carpetas y archivos del proyecto |
| `feature` | Nueva funcionalidad |
| `fix` | Corrección de bugs |
| `docs` | Cambios en documentación |
| `infra` | Servidor, Docker, Nginx, CI/CD |
| `refactor` | Mejora de código sin cambiar funcionalidad |
| `test` | Agregar o modificar tests |
| `style` | Cambios de formato/estilo (sin cambio lógico) |

### 5. Pull Requests

- Todo cambio pasa por Pull Request (PR)
- La rama destino por defecto es `develop` (NO `main`)
- Incluir descripción de qué se hizo y por qué
- El otro miembro del equipo debe revisar antes de mergear
- Usar "Squash and merge" para mantener el historial limpio

### 6. Reglas importantes

- **NUNCA** pushear directo a `main`
- **NUNCA** subir archivos `.env` ni credenciales
- **NUNCA** subir `node_modules/` ni dependencias
- Mantener los commits atómicos (un cambio lógico por commit)
- Si un cambio es grande, dividirlo en commits más chicos

---

## Setup Local

```bash
# Clonar el repo
git clone https://github.com/elchicodesistemas/NaftaHoy.git
cd NaftaHoy

# Cambiar a la rama develop
git checkout develop

# Crear tu rama de trabajo
git checkout -b feature/mi-feature
```

Los pasos de instalación de dependencias se agregarán cuando se defina el stack tecnológico.
