# Guía de despliegue — NaftaHoy

Esta es la única guía vigente para publicar NaftaHoy. La aplicación se ejecuta en contenedores: frontend Next.js, API Express y PostgreSQL. No usa PM2.

## 1. Preparar el VPS

Instalá Docker Engine, Docker Compose y Nginx. En el firewall dejá abiertos solo SSH, 80 y 443. PostgreSQL, frontend y API quedan privados en el servidor.

Cloná el repositorio en una ruta de servicio, por ejemplo `/opt/naftahoy`, y verificá que el dominio `naftahoy.com` y `www.naftahoy.com` apunten al VPS.

## 2. Crear los secretos

En el servidor, dentro del repositorio:

```bash
cp infrastructure/docker/.env.example infrastructure/docker/.env
```

Reemplazá los tres valores por secretos largos, aleatorios y distintos:

- `POSTGRES_PASSWORD`
- `SYNC_API_TOKEN`
- `ADMIN_API_TOKEN`

El archivo `.env` no se sube al repositorio ni se comparte por chat.

## 3. Certificado HTTPS

Antes de activar el archivo [naftahoy.conf](../infrastructure/nginx/naftahoy.conf), emití el certificado de Let's Encrypt para los dos dominios. El sitio debe servir el desafío ACME por HTTP y después redirigir todo el tráfico a HTTPS.

Copiá la configuración a Nginx, comprobala con `nginx -t` y recargá el servicio. Confirmá que las rutas de certificados configuradas existan antes de recargar.

## 4. Construir e iniciar

Desde `infrastructure/docker`:

```bash
docker compose up -d --build
docker compose ps
```

Esperá a que PostgreSQL esté saludable y verificá:

```bash
curl -f https://naftahoy.com/api/health
```

La respuesta debe indicar `status: ok` y mostrar conteos de estaciones y precios.

## 5. Primera carga mensual

Subí el archivo mensual descargado desde la consulta oficial al VPS y ejecutá el importador local. Puede recibir tanto el ZIP como el ACCDB:

```bash
infrastructure/scripts/import-res1104.sh /ruta/precios_eess_2025_en_adelante.accdb
```

El script lee el token administrativo sólo desde el archivo privado `.env` y se conecta directamente al backend local; no publica el archivo ni el token. Luego comprobá que `GET /api/sync/status` tenga una sincronización exitosa, que la portada muestre datos oficiales y que el mapa cargue estaciones. La importación queda en segundo plano, por lo que el archivo puede tardar varios minutos.

La sincronización automática está desactivada deliberadamente: repetí esta carga cuando la Secretaría publique el período siguiente.

## 6. Operación y recuperación

Creá un backup diario fuera del VPS con:

```bash
infrastructure/scripts/backup-postgres.sh
```

Probá periódicamente la restauración en un entorno no productivo. El script de restauración requiere la confirmación explícita `--confirm` porque reemplaza datos existentes.

Monitoreá `https://naftahoy.com/api/health`, el vencimiento del certificado y los logs de los tres contenedores. Ante una actualización, ejecutá primero las validaciones CI y luego `docker compose up -d --build`.

## Checklist de publicación

- [ ] DNS de ambos dominios apunta al VPS.
- [ ] HTTPS y redirección HTTP funcionan.
- [ ] `infrastructure/docker/.env` contiene secretos reales y no está versionado.
- [ ] `docker compose ps` muestra los servicios sanos.
- [ ] `/api/health` responde correctamente.
- [ ] La carga mensual RES 1104/2004 terminó con éxito y se ven precios oficiales.
- [ ] Se realizó y verificó al menos un backup.
- [ ] Se configuró monitoreo externo para la salud del sitio.
