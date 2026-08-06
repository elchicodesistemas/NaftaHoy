# API de NaftaHoy — Guía de integración

> **v1.0** — 2026-08-05. Cubre autenticación, límites y los endpoints actuales para probar
> la API de forma standalone (Postman / curl / DBeaver para cruzar contra la base).
> **v2.0** (pendiente) va a sumar la guía de integración con el frontend Next.js — cómo
> reemplazar `src/data/mockPrices.ts` por llamadas reales a esta API (paso 9 de
> `FICHA_MADUREZ.md`). Hasta que eso pase, esta guía trata la API como si la consumiera
> un tercero externo, no el propio frontend del proyecto.

---

## 1. Antes de arrancar

La API corre localmente, todavía no está deployada.

```bash
cd backend
npm run dev
```

Queda escuchando en `http://localhost:3001`. Necesitás `backend/.env` con `DATABASE_URL` y
`API_KEY` completos (ver `backend/.env.example`) — sin eso el server no arranca o rechaza
todo con 500.

---

## 2. Base URL

| Entorno | URL |
|---|---|
| Local | `http://localhost:3001` |
| Producción | No existe todavía — el backend no está deployado en el servidor |

---

## 3. Autenticación

Todo lo que cuelga de `/api/*` requiere el header:

```
x-api-key: <tu-api-key>
```

Tu key está en `backend/.env` (`API_KEY=...`). Si necesitás una nueva:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

`GET /health` es la única ruta pública — no pide key. Es a propósito, para poder chequear
que el server está vivo sin exponer nada de datos.

**Si falta la key o no matchea:**
```json
// 401
{ "error": "API key inválida o faltante" }
```

**Si el server no tiene `API_KEY` configurada (bug de infraestructura, no tuyo):**
```json
// 500
{ "error": "API_KEY no configurada en el servidor" }
```

---

## 4. Rate limit

**100 requests cada 15 minutos**, contadas por API key (no por IP, mientras mandes la key).

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

### `GET /api/precios`

Requiere `x-api-key`. Devuelve precios de combustible reportados en "Precios en Surtidor"
(fuente oficial — ver `docs/fuentes-datos.md`). Hoy lee de la vista `v_precios_surtidor`
(36.739 filas reales) — **no** de las tablas normalizadas `estaciones`/`precios_actuales`
de `schema.ts`, que todavía no están migradas (contexto completo en `CLAUDE.md`).

**Query params — todos opcionales:**

| Param | Tipo | Match | Ejemplo |
|---|---|---|---|
| `producto` | string | parcial, sin distinguir mayúsculas | `nafta` |
| `empresa` | string | parcial, sin distinguir mayúsculas | `YPF` |
| `provincia` | string | exacto | `BUENOS AIRES` |
| `region` | string | exacto (contra `region_normalizada`) | `PAMPEANA` |
| `limit` | número | — | `20` (default `50`, máximo `500`) |
| `offset` | número | — | `0` (default `0`) |

**Ejemplo:**
```bash
curl -H "x-api-key: TU_KEY" \
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

1. `cd backend && npm run dev` — confirmar que loguea `API escuchando en http://localhost:3001`.
2. Abrir Postman → **Import** → `backend/postman/NaftaHoy-API.postman_collection.json`.
3. En la colección, click derecho → **Edit** → variable `apiKey` → pegar tu valor real de
   `backend/.env`. (La variable queda vacía en el archivo a propósito — nunca se commitea el
   valor real a git.)
4. Correr **"Health check"** → tiene que dar `200 { "ok": true }`. Si esto falla, el problema
   es que el server no está levantado, no la API en sí.
5. Correr **"Precios - sin filtros"** → tiene que devolver 20 filas reales.
6. Correr **"Precios - sin API key (debe dar 401)"** → confirmar que efectivamente corta.
7. Jugar con **"Precios - filtro por producto"** y **"filtro por empresa y provincia"**,
   cambiando los query params desde la pestaña Params de Postman.
8. (Opcional) Cruzar un resultado contra DBeaver: tomar una fila de la respuesta y buscarla
   en `v_precios_surtidor` con un `SELECT` filtrando por `cuit` + `fecha_vigencia` — tiene
   que ser exactamente la misma fila.

---

## 7. Qué todavía no tiene esta API

- Solo lectura — no hay `POST`/`PUT`/`DELETE` todavía.
- Sin documentación OpenAPI/Swagger interactiva (se podría sumar más adelante).
- La fuente de datos (`v_precios_surtidor`) es provisoria — puede cambiar si se decide migrar
  a las tablas normalizadas de `schema.ts`.
- Sin deploy — solo corre local por ahora.
- El rate limit es en memoria del proceso — si en algún momento corren varias instancias del
  server en paralelo, el límite efectivo se multiplica (hace falta un store compartido tipo
  Redis para que siga siendo 100 real).

---

## Referencias

- `CLAUDE.md` — contexto técnico completo del backend y decisión de fuente de datos.
- `docs/fuentes-datos.md` — de dónde sale "Precios en Surtidor" y cómo se normalizan los campos.
- `backend/postman/NaftaHoy-API.postman_collection.json` — colección lista para importar.
- `FICHA_MADUREZ.md`, paso 8 — estado del plan de la API.
