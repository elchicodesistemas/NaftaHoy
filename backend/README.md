# NaftaHoy — Backend

API en Hono + Drizzle + PostgreSQL. Para el detalle de endpoints, auth y rate
limit ver [`../docs/api-guia-integracion.md`](../docs/api-guia-integracion.md).

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable       | Requerida | Default                 | Descripción                                                                 |
| -------------- | --------- | ------------------------ | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | Sí        | —                         | Connection string completo de Postgres.                                      |
| `JWT_SECRET`   | Sí        | —                         | Firma los JWT de `POST /auth/token`. Generar con `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`. |
| `JWT_EXPIRES_IN` | No      | `1h`                      | Vida del access token (formato `ms`, ej: `1h`, `15m`, `7d`).                  |
| `PORT`         | No        | `3001`                    | Puerto del server local.                                                      |
| `CORS_ORIGIN`  | No        | `http://localhost:3000`  | Orígenes permitidos, separados por coma (sin espacios).                       |

Todas se validan al arrancar (`src/config/env.ts`, con Zod) — si falta algo
requerido, el server no levanta y te dice exactamente qué falta.

## Comandos

```bash
npm install
npm run dev     # tsx watch, http://localhost:3001
npm run build && npm start   # build de producción

npm run lint         # Biome check
npm run lint:fix

npm run db:generate  # genera SQL para schema.ts (8 tablas, sin migrar todavía)
npm run db:migrate
npm run db:generate:integradores  # ídem para la tabla integradores (config separado)
npm run db:migrate:integradores
npm run db:studio    # Drizzle Studio, apunta a schema.ts

npm run seed:integrador -- <usuario> <empresa> <secret>  # crea una fila en integradores
```

Ver `CLAUDE.md` (raíz del proyecto) para el detalle de por qué `integradores`
tiene un config de Drizzle separado y el workaround manual de migración por el
bloqueo de permisos en `naftahoy_dev`.
