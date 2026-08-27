# Setup del Repositorio — Paso a paso

## Pre-requisitos

- Git instalado en tu máquina
- Acceso al repo: https://github.com/elchicodesistemas/NaftaHoy.git

---

## Paso 1: Inicializar el repo local

Abrí una terminal (CMD, PowerShell o Git Bash) en tu carpeta del proyecto:

```bash
cd C:\Users\Lenovo\OneDrive\Desktop\NAFTAHOY
```

Inicializar Git y conectar con el repo remoto:

```bash
git init
git remote add origin https://github.com/elchicodesistemas/NaftaHoy.git
```

---

## Paso 2: Primer commit a main

```bash
git add .
git commit -m "[2026-04-23] estructura: Inicialización del repositorio con estructura base del proyecto"
git branch -M main
git push -u origin main
```

---

## Paso 3: Crear rama develop

```bash
git checkout -b develop
git push -u origin develop
```

---

## Paso 4: Crear rama infrastructure

```bash
git checkout -b infrastructure
git push -u origin infrastructure
```

---

## Paso 5: Volver a develop para trabajar

```bash
git checkout develop
```

---

## Verificación

Después de ejecutar todo, en GitHub deberías ver 3 ramas:

- `main` ← Con toda la estructura del proyecto
- `develop` ← Copia de main, lista para recibir features
- `infrastructure` ← Copia de main, para config del servidor

---

## Para tu compañero

Tu compañero solo necesita hacer:

```bash
git clone https://github.com/elchicodesistemas/NaftaHoy.git
cd NaftaHoy
git checkout develop
```

Y para crear su primera feature:

```bash
git checkout -b feature/nombre-de-su-feature
```

---

## Listo

A partir de acá, todo el desarrollo se hace creando ramas `feature/*` desde `develop` y mergeando vía Pull Request. Ver `CONTRIBUTING.md` para más detalle.
