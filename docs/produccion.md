# Puesta en producción

## Antes de publicar

1. Instalá Docker Engine y el plugin Docker Compose en el VPS.
2. Configurá el DNS de `naftahoy.com` y `www.naftahoy.com` hacia el VPS.
3. Copiá `infrastructure/docker/.env.example` a `infrastructure/docker/.env` y reemplazá cada valor de ejemplo con secretos distintos y aleatorios. Este archivo nunca se versiona.
4. Permití en el firewall únicamente los puertos 80 y 443. Los puertos 3000, 3001 y 5432 deben permanecer privados.
5. Emití el certificado TLS para ambos dominios y verificá que las rutas configuradas en `infrastructure/nginx/naftahoy.conf` existan.

## Arranque y verificación

Desde `infrastructure/docker`, iniciá los servicios con `docker compose up -d --build`. Luego verificá:

- `docker compose ps`: PostgreSQL, backend y frontend deben figurar saludables o en ejecución.
- `curl -f https://naftahoy.com/api/health`: debe informar `status: ok` y conteos de estaciones/precios.
- Ejecutá la carga mensual manual desde el VPS con `infrastructure/scripts/import-res1104.sh /ruta/al/archivo.accdb` (o `.zip`); confirmá el avance en `/api/sync/status` y que la portada muestre datos oficiales.
- Comprobá el formulario de reportes: debe confirmar que la publicación queda pendiente.

## Moderación de reportes

Los reportes de la comunidad no se publican automáticamente. Para revisarlos, usá un cliente administrativo con `Authorization: Bearer <ADMIN_API_TOKEN>`:

- `GET /api/reports/pending` lista los pendientes.
- `PATCH /api/reports/<id>/status` con cuerpo `{ "status": "APPROVED" }` los publica.
- El mismo endpoint con `{ "status": "REJECTED" }` los descarta.

No expongas el token en el navegador ni lo incluyas en enlaces, scripts o repositorios.

## Operación continua

- Programá un respaldo diario del volumen `postgres-data` y probá una restauración antes del lanzamiento.
- Configurá alertas para el endpoint de salud y para errores de los contenedores.
- Renovación automática: verificá que el mecanismo elegido para Let's Encrypt recargue Nginx al renovarse el certificado.
- La sincronización automática está deliberadamente desactivada: cada período publicado se importa de forma manual desde el archivo de RES 1104/2004.
