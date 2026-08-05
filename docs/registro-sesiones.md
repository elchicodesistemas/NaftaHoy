# Registro de sesiones — NaftaHoy

> Una entrada corta por sesión de trabajo, la más nueva arriba. El objetivo es que la sesión de
> Claude Code que arranca en la otra máquina se ubique rápido: qué se tocó y desde dónde, sin
> tener que releer todo `git log`. El detalle de cada cambio ya vive en los mensajes de commit —
> acá va el resumen, no la repetición.
>
> No confundir con `../../../_registro/BITACORA.md` (esquema de trabajo): esa bitácora es para
> decisiones que cambian el rumbo de cualquier proyecto. Esta es local a NaftaHoy y es por sesión,
> no por decisión.

---

## 2026-08-05 — Máquina 1 (personal)

- Cerrados los pasos 2, 3 y 5 del plan de acción de `FICHA_MADUREZ.md`:
  - Paso 2: eliminado `frontend/prisma/` — Drizzle queda como único ORM.
  - Paso 3: Leaflet movido a `frontend/package.json`; se descarta `react-leaflet` (no se usaba,
    y v5 requiere React 19, incompatible con el React 18 pineado).
  - Paso 5: Biome configurado como linter + formateador único (raíz + frontend + backend);
    corregidos los hallazgos reales (botones sin `type`, SVGs decorativos sin `aria-hidden`,
    keys de React inestables, `href="#"` placeholders). Los 6 `noExplicitAny` de
    `StationMap.tsx` quedan sin tocar a propósito — son alcance del paso 10.
- `FICHA_MADUREZ.md` actualizada: checklist de N1, tabla de stack, estado de salud, plan de
  acción y decisiones tomadas reflejan lo de arriba.
- Se arma el listado de preguntas para el compañero de IT sobre el paso 4 (pnpm workspaces,
  puede romper `deploy.sh`) y sobre qué ramas remotas son sobrantes seguros (`Dev` y
  `feature/frontend-inicial` ya están 100% mergeadas; `feature/agentes-backend-integracion` y
  `feature/setup-claude-code` tienen commits propios sin mergear, no tocar sin confirmar).
- Pusheado a `feature/rediseno-frontend`. Queda pendiente **paso 4** (bloqueado por coordinación
  con IT, no técnico).
- Se agrega este archivo y la sección "Trabajo multi-máquina" en `CLAUDE.md`.

---
