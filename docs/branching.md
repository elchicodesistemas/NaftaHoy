# Estrategia de Ramas — NaftaHoy

## Diagrama de ramas

```
main ─────────────────────────────────────────────► (producción)
  │                          ▲
  │                          │ merge (release)
  │                          │
  └── develop ───────────────┼────────────────────► (integración)
        │         ▲    ▲     │
        │         │    │     │
        ├── feature/ingesta-shell-api
        │         │
        ├── feature/frontend-home
        │              │
        ├── feature/historicos-graficos
        │
        └── infrastructure ───────────────────────► (servidor/deploy)
```

## Descripción de cada rama

### `main`
- Rama de **producción**
- Solo recibe merges desde `develop` cuando hay un release listo
- Siempre debe estar estable y funcional
- **NUNCA** pushear directo

### `develop`
- Rama de **integración**
- Todas las features se mergean acá vía Pull Request
- Es la rama donde se prueba que todo funcione junto
- Base para crear ramas `feature/*`

### `infrastructure`
- Configuración del servidor, Docker, Nginx, scripts de deploy
- Se mergea a `develop` cuando los cambios de infra están listos
- Archivos típicos: `docker-compose.yml`, configs de Nginx, scripts bash

### `feature/*`
- Una rama por cada funcionalidad nueva
- Nombrar de forma descriptiva: `feature/ingesta-shell-api`, `feature/frontend-comparador`
- Se crean desde `develop`, se mergean a `develop` vía PR
- Se eliminan después del merge

### `hotfix/*`
- Solo para correcciones urgentes en producción
- Se crean desde `main`, se mergean a `main` Y a `develop`
- Nombrar: `hotfix/fix-precio-null`

## Comandos rápidos de referencia

```bash
# Ver en qué rama estoy
git branch

# Cambiar a develop
git checkout develop

# Crear nueva feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-feature

# Subir mi rama al repo
git push -u origin feature/mi-nueva-feature

# Después del PR aprobado y mergeado, limpiar
git checkout develop
git pull origin develop
git branch -d feature/mi-nueva-feature
```
