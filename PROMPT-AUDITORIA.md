# Prompt para Claude Code — Auditoría de NaftaHoy

> **Cómo usarlo:** abrí la terminal integrada de Antigravity en la carpeta `NaftaHoy`, corré `claude`,
> y pegá todo el bloque de abajo (desde "Contexto" hasta el final).
> Está escrito para que el agente **no toque nada** hasta que vos digas.

---

## ⚠️ Cuándo conviene usar este prompt

Este prompt sirve para pedir una **segunda opinión independiente** sobre el proyecto.

- **Si lo corrés ANTES de ejecutar los pasos 1-3** (`PROMPT-EJECUCION.md`): el agente llega a sus
  propias conclusiones sin haber leído las mías, y podés comparar. Es la versión útil de verdad.
- **Si lo corrés DESPUÉS:** los puntos **1** (Prisma) y **11** (Leaflet) van a estar desactualizados,
  porque esos cambios ya se hicieron. Avisale al agente que los saltee, o va a perder tiempo
  auditando algo que ya no existe.

En los dos casos: **no le pases `FICHA_MADUREZ.md`.** El valor de una segunda opinión es que no
esté contaminada por la primera. Si coincide, ganás confianza. Si difiere, aprendés algo.

---

## ⚠️ Antes de pegar: tenés 20+ archivos sin commitear

`git status` muestra modificaciones sin guardar en `backend/`, `docs/`, `CLAUDE.md`, `.gitignore` y más,
sobre la rama `feature/rediseno-frontend`. Resolvé esto primero o vas a perder trabajo:

```bash
git status                    # mirá qué hay
git stash push -m "wip antes de auditoria"   # opción A: guardar aparte
# o bien
git add -A && git commit -m "chore: guardar estado antes de auditoria"   # opción B: commitear
```

---

# ⬇️ COPIAR DESDE ACÁ ⬇️

## Contexto

Sos un **Analista de Sistemas Senior**. Trabajás conmigo (22 años, aprendiendo buenas prácticas)
como mentor técnico, no como generador de código.

Este proyecto vive dentro de mi carpeta `Esquema de trabajo`, que tiene reglas comunes a todos mis
proyectos. **Antes de responder nada, leé estos archivos** (están en la carpeta padre, dos niveles arriba):

- `../../CLAUDE.md` — el contrato: mi rol, tu rol, cómo trabajamos
- `../../_sistema/00-stack-oficial.md` — el stack que quiero fijar y por qué
- `../../_sistema/02-niveles-madurez.md` — los niveles N0→N4
- `../../_sistema/03-protocolo-auditoria.md` — el protocolo que tenés que seguir

Y del proyecto en sí:

- `CLAUDE.md` (el del proyecto, ya existe)
- `README.md`, `docs/arquitectura.md`, `docs/backend-funcional.md`, `docs/frontend-funcional.md`

## Qué necesito de vos

**Objetivo principal: decidir qué tecnologías conservo y cuáles saco de este proyecto,
para que sea mi stack de referencia de acá en adelante.**

No quiero una lista de "mejores prácticas" genérica. Quiero que mires *este* código y me digas,
con nombre y apellido, qué se queda y qué se va.

## Restricción dura

**Fase 1 = solo lectura.** No modifiques, no crees ni borres ningún archivo hasta que yo apruebe
el plan. Podés correr comandos de lectura (`ls`, `cat`, `git log`, `grep`, `find`). Nada más.

## Puntos concretos que quiero que verifiques

Detecté estas cosas de arriba. Confirmalas o desmentilas, y decime en cada caso **qué se rompe
concretamente si lo dejo así**:

1. **Dos ORMs conviviendo.** `backend/` usa **Drizzle** (`drizzle.config.ts`, `backend/drizzle/`,
   `src/models/schema.ts`) y `frontend/` tiene un **Prisma** (`frontend/prisma/schema.prisma`) con
   un modelo `Price` propio. ¿Son dos fuentes de verdad del mismo dato? ¿Cuál me quedo y por qué?

2. **Tres `package.json` y tres `package-lock.json`** (raíz, backend, frontend), todos con npm.
   El de la raíz solo tiene `leaflet`, `react-leaflet` y `@types/leaflet` — sin `name`, sin scripts —
   pero quien usa Leaflet es `frontend/src/components/StationMap.tsx`.
   ¿Esto tendría que ser un **monorepo con pnpm workspaces** o dos proyectos separados? Decidilo y justificalo.

3. **El backend está a medio nacer.** `src/routes/`, `src/services/` y `src/utils/` están vacíos
   (solo `.gitkeep`). Lo único real es `src/workers/importarSurtidorEnergia.ts` y el schema.
   Un commit menciona "Express" pero no hay `express` en las dependencias.
   ¿Qué falta para que exista una API? ¿Conviene Express, Hono, o directamente Route Handlers de Next
   y me ahorro el backend separado?

4. **El frontend no está conectado a nada.** Usa `src/data/mockPrices.ts`.
   ¿Cuál es el camino más corto para que muestre datos reales sin romper lo que ya se ve bien?

5. **CI vacía.** `.github/workflows/` existe pero no tiene ningún workflow.

6. **Ramas duplicadas y en desorden.** Local: `main`, `develop`, `infrastructure`, y cuatro `feature/*`.
   Remoto: además hay `Dev` **y** `develop` (misma rama con distinta capitalización — en Windows esto
   genera conflictos reales). Proponeme una limpieza y un modelo de ramas simple para una sola persona.

7. **Commits fuera de convención.** El historial usa `feature:`, `estructura:` y un prefijo `[fecha]`.
   Conventional Commits usa `feat:`, `chore:`, `refactor:`. ¿Vale la pena cambiar de acá en adelante?
   (no reescribir el historial)

8. **`infrastructure/`** son cuatro carpetas vacías con `.gitkeep` más una captura de pantalla
   commiteada. ¿Sirve para algo hoy o es ruido?

9. **Versiones pineadas.** `next` está clavado en `14.2.25` por un fix viejo de build en el servidor.
   ¿Sigue haciendo falta? ¿Conviene subir a Next 15?

10. **Secretos.** Revisá que no haya claves, tokens ni credenciales en el código ni en el historial de git.
    Incluí `backend/.env.example` en la revisión.

11. **El mapa de Leaflet (`frontend/src/components/StationMap.tsx`).** Acá hay algo raro y quiero
    entenderlo bien, porque el mapa es el corazón del producto:

    - El componente **no importa Leaflet como módulo**. Inyecta un `<script>` y un `<link>` desde el
      CDN de cdnjs en tiempo de ejecución (líneas ~99-110) y después lee `(window as any).L`.
    - Al mismo tiempo, `leaflet`, `react-leaflet` y `@types/leaflet` **sí están instalados** — en el
      `package.json` de la raíz — y **nadie los importa**. ¿Son dependencias muertas?
    - Como todo pasa por `window.L`, no hay tipos: `useRef<any>`, `const L = (window as any).L`.
      Perdí TypeScript justo en el componente más complejo.
    - Los marcadores se arman **concatenando HTML en strings** dentro de `L.divIcon({ html: ... })`.
      Hoy los datos son fijos, pero cuando el nombre de la estación venga de la base, eso entra
      directo al DOM. ¿Es un riesgo de XSS? ¿Cómo se arregla?
    - Las 8 estaciones están **hardcodeadas dentro del componente** (líneas 12-21), ni siquiera
      en `src/data/`.

    Decidime cuál de estos tres caminos conviene y por qué:
    **(a)** usar `react-leaflet` que ya está instalado, **(b)** usar `leaflet` importado como módulo
    con `dynamic import` de Next para evitar el problema de SSR, o **(c)** cambiar de librería
    (MapLibre / Mapbox) — y en ese caso, qué me cuesta la migración.
    Tené en cuenta que el mapa **ya funciona y se ve bien**: no quiero romperlo por prolijidad.

## Formato de respuesta

Seguí el protocolo de auditoría, en este orden:

**1. Diagnóstico inicial** — qué hace NaftaHoy hoy, en serio, sin lo que dice la documentación
si no coincide con el código.

**2. Propósito y visión** — Qué es / Cómo funciona (recorrido de un dato de punta a punta) /
Para qué sirve / Objetivo a 1 mes, 6 meses y ambición máxima.

**3. Semáforo de salud** con archivo y línea donde corresponda:
```
🔴 CRÍTICO   —
🟡 MEJORABLE —
🟢 SANO      —
```

**4. Veredicto de stack** — esto es lo que más me importa. Una tabla:

| Tecnología | Dónde se usa | Veredicto | Por qué |
|---|---|---|---|
| ... | ... | ✅ conservar / ⚠️ revisar / ❌ sacar | ... |

Y abajo, en dos líneas: **cuál es mi stack definitivo para este proyecto**.

**5. Nivel de madurez** — en qué N está hoy, cuál debería ser el objetivo, qué falta exactamente.

**6. Plan de acción numerado**, ordenado por riesgo bajo primero. Cada paso con:
Qué / Por qué ahora / Riesgo de romper (bajo-medio-alto) / Tiempo estimado / Cómo verificamos que salió bien.

**7. Cierre** — recomendame por dónde arrancar con 2 o 3 opciones concretas.

## Reglas mientras trabajamos

- Explicame el **por qué** de cada decisión: qué gano, qué pierdo, qué alternativa descartaste.
- Cuando uses un término técnico nuevo, definilo en una línea.
- **Una cosa por vez.** No me tires seis archivos de golpe. Terminá un paso, verificalo, seguí.
- Si algo no lo podés determinar leyendo el código, decí "no determinado" en vez de suponer.
- No propongas reescribir desde cero.
- No instales nada ni sumes dependencias sin preguntarme antes.

# ⬆️ COPIAR HASTA ACÁ ⬆️

---

## Después de la auditoría

Cuando termine, pedile esto para dejar registro:

```
Actualizá FICHA.md del proyecto con la plantilla de ../../_plantillas/FICHA-PROYECTO.md,
y agregá una entrada en ../../_registro/BITACORA.md con la decisión de stack que tomamos.
Si decidimos algo importante (sacar Prisma, elegir monorepo, etc.), escribí el ADR
correspondiente en docs/adr/ usando ../../_plantillas/ADR.md.
```
