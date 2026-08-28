#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Uso: $0 /ruta/precios_eess_2025_en_adelante.zip|.accdb" >&2
  exit 1
fi

ARCHIVE="$1"
if [ ! -f "$ARCHIVE" ]; then
  echo "No existe el archivo: $ARCHIVE" >&2
  exit 1
fi

case "$ARCHIVE" in
  *.zip) FORMAT="zip" ;;
  *.accdb) FORMAT="accdb" ;;
  *) echo "El archivo debe ser .zip o .accdb" >&2; exit 1 ;;
esac

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
ENV_FILE="$PROJECT_DIR/infrastructure/docker/.env"
ADMIN_TOKEN="$(sed -n 's/^ADMIN_API_TOKEN=//p' "$ENV_FILE" | head -n 1)"
if [ -z "$ADMIN_TOKEN" ]; then
  echo "No se encontró ADMIN_API_TOKEN en $ENV_FILE" >&2
  exit 1
fi

curl --fail-with-body --request POST "http://127.0.0.1:3001/api/admin/imports/res1104" \
  --header "Authorization: Bearer $ADMIN_TOKEN" \
  --header "Content-Type: application/octet-stream" \
  --header "X-Naftahoy-Import-Format: $FORMAT" \
  --data-binary "@$ARCHIVE"
