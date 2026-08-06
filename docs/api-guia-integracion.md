# API de NaftaHoy — Guía de integración

> **v1.1** — 2026-08-06. Cubre autenticación, límites y los endpoints actuales para probar
> la API de forma standalone (Postman / curl / DBeaver para cruzar contra la base).
> **v2.0** (pendiente) va a sumar la guía de integración con el frontend Next.js — cómo
> reemplazar `src/data/mockPrices.ts` por llamadas reales a esta API (paso 9 de
> `FICHA_MADUREZ.md`). Hasta que eso pase, esta guía trata la API como si la consumiera
> un tercero externo, no el propio frontend del proyecto.
>
> **Cambios desde v1.0:** la autenticación pasó de una API key estática compartida a un
> flujo de dos pasos (credenciales de integrador → token Bearer de vida corta), con las
> credenciales registradas en una tabla en Postgres en vez de una sola variable de entorno.

---

## 1. Antes de arrancar

La API corre localmente, todavía no está deployada.

```bash
cd backend
npm run dev
```

Queda escuchando en `http://localhost:3001`. Necesitás `backend/.env` con `DATABASE_URL`,
`JWT_SECRET` y `JWT_EXPIRES_IN` completos (ver `backend/.env.example`) — sin `JWT_SECRET`
el server ni arranca.

Además necesitás un **integrador registrado** en la tabla `integradores` — no hay
auto-registro todavía. Se crea (o se rehabilita) con:

```bash
cd backend
npm run seed:integrador -- <usuario> <empresa> <secret>
```

Esto deja la fila con `habilitado = true`. Sin eso, `POST /auth/token` va a rechazar
cualquier credencial aunque esté "bien escrita".

---

## 2. Base URL

| Entorno | URL |
|---|---|
| Local | `http://localhost:3001` |
| Producción | No existe todavía — el backend no está deployado en el servidor |

---

## 3. Autenticación

Flujo de dos pasos, mismo patrón estructural que usan otras APIs de integradores (client
credentials → token de vida corta → Bearer):

### Paso 1 — pedir un token

```bash
curl -X POST http://localhost:3001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"usuario": "TU_USUARIO", "empresa": "TU_EMPRESA", "secret": "TU_SECRET"}'
```

`empresa` es obligatoria y se valida contra la fila del integrador (case-insensitive) —
`usuario` es único a nivel global, pero varias personas de una misma empresa pueden tener
usuarios distintos, así que pedir `empresa` acá evita asumirla en silencio desde la fila.

**Response — `200`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

`expiresIn` está en segundos (3600 = 1 hora). **No hay refresh token en esta primera
instancia** — cuando el token expira, se vuelve a pedir uno nuevo con el mismo `POST`.

**Si el usuario no existe, la empresa no coincide, el secret no coincide, o el integrador
está deshabilitado** (mismo mensaje para los cuatro casos, a propósito — no se revela cuál
de los cuatro pasó):
```json
// 401
{ "error": "Credenciales inválidas" }
```

### Paso 2 — usar el token

Todo lo que cuelga de `/api/*` requiere el header:

```
Authorization: Bearer <accessToken>
```

**Si falta el header:**
```json
// 401
{ "error": "Falta el token de autenticación" }
```

**Si el token es inválido o ya venció:**
```json
// 401
{ "error": "Token inválido o vencido" }
```

`GET /health` es la única ruta pública — no pide token. Es a propósito, para poder chequear
que el server está vivo sin exponer nada.

---

## 4. Rate limit

Dos límites separados:

| Ruta | Límite | Por qué |
|---|---|---|
| `POST /auth/token` | 10 cada 15 min, por IP | Frena fuerza bruta contra `usuario`/`secret` |
| `GET /api/precios` (y el resto de `/api/*`) | 100 cada 15 min, por IP | Uso general |

Cada respuesta incluye headers informativos:
```
ratelimit: limit=100, remaining=98, reset=900
ratelimit-policy: 100;w=900
```

Al superar el límite:
```
429 Too Many Requests
```
```
Too many requests, please try again later.
```
(texto plano, no JSON — es la respuesta default de la librería de rate limit)

---

## 5. Endpoints

### `GET /health`

Sin autenticación. Para monitoreo / smoke test.

```bash
curl http://localhost:3001/health
```
```json
{ "ok": true }
```

---

### `POST /auth/token`

Ver sección 3. Body `{ usuario, secret }`, devuelve `{ accessToken, tokenType, expiresIn }`.

---

### `GET /api/precios`

Requiere `Authorization: Bearer <token>`. Devuelve precios de combustible reportados en
"Precios en Surtidor" (fuente oficial — ver `docs/fuentes-datos.md`). Hoy lee de la vista
`v_precios_surtidor` (36.739 filas reales) — **no** de las tablas normalizadas
`estaciones`/`precios_actuales` de `schema.ts`, que todavía no están migradas (contexto
completo en `CLAUDE.md`).

**Query params — todos opcionales:**

| Param | Tipo | Match | Ejemplo |
|---|---|---|---|
| `producto` | string | parcial, sin distinguir mayúsculas | `nafta` |
| `empresa` | string | parcial, sin distinguir mayúsculas | `YPF` |
| `provincia` | string | exacto | `BUENOS AIRES` |
| `region` | string | exacto (contra `region_normalizada`) | `PAMPEANA` |
| `limit` | número | — | `20` (default `50`, máximo `200`) |
| `offset` | número | — | `0` (default `0`) |

**Ejemplo:**
```bash
curl -H "Authorization: Bearer TU_TOKEN" \
  "http://localhost:3001/api/precios?producto=nafta&provincia=BUENOS%20AIRES&limit=5"
```

**Response — `200`:**
```json
{
  "limit": 5,
  "offset": 0,
  "count": 5,
  "data": [
    {
      "indiceTiempo": "2026-05",
      "idEmpresa": 1376,
      "cuit": "33-64337382-9",
      "empresa": "10 DE SETIEMBRE S.A.",
      "direccion": "Av. Mosconi 299",
      "localidad": "LOMAS DEL MIRADOR",
      "provincia": "BUENOS AIRES",
      "region": "PAMPEANA",
      "idProducto": 3,
      "producto": "Nafta (premium) de más de 95 Ron",
      "idTipoHorario": 2,
      "tipoHorario": "Diurno",
      "precio": "2347.00",
      "fechaVigencia": "2026-05-01T15:43:00.000Z",
      "idEmpresaBandera": 28,
      "empresaBandera": "PUMA",
      "latitud": -34.658476,
      "longitud": -58.529443,
      "geojson": "{\"type\":\"Point\",\"coordinates\":[-58.529443,-34.658476]}",
      "regionNormalizada": "PAMPEANA"
    }
  ]
}
```

`data` viene vacío (`[]`) si no hay resultados para el filtro — no es un error, es `200`.

---

## 6. Primer test paso a paso (quickstart)

1. `cd backend && npm run seed:integrador -- naftahoy-frontend NaftaHoy tu-secret-de-prueba`
   — crea (o rehabilita) tu integrador de prueba.
2. `cd backend && npm run dev` — confirmar que loguea `API escuchando en http://localhost:3001`.
3. Abrir Postman → **Import** → `backend/postman/NaftaHoy-API.postman_collection.json`.
4. En la colección, click derecho → **Edit** → variables `usuario` y `secret` → completar
   con lo que usaste en el paso 1. (Quedan vacías en el archivo a propósito — nunca se
   commitean valores reales a git.)
5. Correr **"Health check"** → tiene que dar `200 { "ok": true }`. Si esto falla, el problema
   es que el server no está levantado, no la API en sí.
6. Correr **"Auth - obtener token"** → tiene que dar `200` con un `accessToken`. Un script en
   la request lo guarda solo en la variable de colección `bearerToken` — no hay que copiarlo
   a mano.
7. Correr **"Precios - sin filtros"** → tiene que devolver 20 filas reales (usa `bearerToken`
   automáticamente, vía la autenticación a nivel de colección).
8. Correr **"Precios - sin token (debe dar 401)"** → confirmar que efectivamente corta.
9. Jugar con **"Precios - filtro por producto"** y **"filtro por empresa y provincia"**,
   cambiando los query params desde la pestaña Params de Postman.
10. (Opcional) Cruzar un resultado contra DBeaver: tomar una fila de la respuesta y buscarla
    en `v_precios_surtidor` con un `SELECT` filtrando por `cuit` + `fecha_vigencia` — tiene
    que ser exactamente la misma fila.

---

## 7. Qué todavía no tiene esta API

- Solo lectura — no hay `POST`/`PUT`/`DELETE` sobre precios todavía.
- Sin refresh token — al expirar el access token, hay que volver a pedir uno nuevo.
- Sin endpoint de auto-registro de integradores — las filas se crean a mano
  (`npm run seed:integrador`), y habilitar/deshabilitar accesos también es manual.
- Sin documentación OpenAPI/Swagger interactiva (se podría sumar más adelante).
- La fuente de datos (`v_precios_surtidor`) es provisoria — puede cambiar si se decide migrar
  a las tablas normalizadas de `schema.ts`.
- Sin deploy — solo corre local por ahora.
- El rate limit es en memoria del proceso — si en algún momento corren varias instancias del
  server en paralelo, el límite efectivo se multiplica (hace falta un store compartido tipo
  Redis para que siga siendo real).

---

## Referencias

- `CLAUDE.md` — contexto técnico completo del backend, auth y decisión de fuente de datos.
- `docs/fuentes-datos.md` — de dónde sale "Precios en Surtidor" y cómo se normalizan los campos.
- `backend/postman/NaftaHoy-API.postman_collection.json` — colección lista para importar.
- `FICHA_MADUREZ.md`, paso 8 — estado del plan de la API.
