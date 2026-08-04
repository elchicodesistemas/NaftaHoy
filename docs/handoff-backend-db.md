# Traspaso backend ↔ base de datos

Preguntas para cerrar con el compañero (infraestructura/VPS/DB) antes de avanzar con el servidor
Express y las rutas de la API. Sus respuestas destraban el resto del trabajo de backend.

## 1. Conexión

- Host / puerto real para que el backend Node (no solo DBeaver) se conecte directo: ¿es el mismo
  `179.43.124.36:5432` documentado en `CLAUDE.md`, o cambió?
- ¿El puerto de Postgres está abierto directo a internet, o DBeaver se conecta por SSH tunnel /
  VPN? Si es túnel, el backend Node en desarrollo va a necesitar el mismo túnel activo para poder
  conectarse — importa para decidir cómo levantar el server local.
- Usuario `naftahoy_dev`: ¿es el mismo usuario que va a usar la app en producción, o hace falta un
  usuario de aplicación aparte (separado del usuario personal de DBeaver)?
- Nombre real de la base con los datos ya cargados: ¿sigue siendo `naftahoy_prueba`, o es otra?

## 2. Esquema y datos ya cargados

- ¿Las tablas que ya existen se crearon corriendo la migración de Drizzle del repo
  (`backend/drizzle/0000_thin_goblin_queen.sql`), o se crearon a mano / con otro método? Esto
  importa porque si no coinciden exactamente con `backend/src/models/schema.ts`, el código del
  backend va a fallar al leer/escribir.
- ¿Con qué se cargaron los registros actuales? (¿el worker `importarSurtidorEnergia.ts` del repo,
  un dump, algo manual?) Para no volver a insertar los mismos datos por duplicado.
- ¿Hay un ambiente de "prueba" separado de uno de "producción", o todavía es todo el mismo?

## 3. Operación

- ¿Quién corre `drizzle-kit migrate` de acá en adelante cuando cambie el schema — cada uno con su
  usuario, o hay que coordinar para no pisar datos?
- Cron/automatización: para actualizar precios periódicamente (cada 1-4hs, ver
  `docs/fuentes-datos.md`) hace falta correr un script en algún lado con acceso a la base — ¿se
  corre desde el mismo VPS (rama `infrastructure`) o desde otro proceso?

## 4. Deploy del backend (para más adelante, no ahora)

- Cuando el backend esté listo para exponerse como API: ¿subdominio (`api.naftahoy.com`) o path
  (`naftahoy.com/api`) detrás de Nginx? Mismo patrón que ya usan para el frontend con PM2.

## 5. Parametrización de negocio (pendiente, no es técnica pero afecta las queries)

Ya diagnosticado en `docs/backend-funcional.md` §6 — dejarlo resuelto en la misma charla ahorra
una segunda vuelta:

- **Marcas**: el dataset trae 11 petroleras reales, el frontend hoy solo soporta 4 (`ypf`,
  `shell`, `axion`, `puma`). ¿Se muestran las 11 o se agrupan las nuevas bajo "Otras"?
- **Nivel de agregación de precios**: ¿promedio nacional por petrolera, por provincia, o precio
  por estación puntual?
- **Variación %**: no es una columna, se calcula contra `precios_historico`. ¿Contra qué ventana
  (día anterior, semana)?
- **Selector de zona**: el schema ya soporta `provincia`/`localidad`. ¿Se habilita ya el selector
  o se arranca fijo en "CABA y GBA" como está hoy?
