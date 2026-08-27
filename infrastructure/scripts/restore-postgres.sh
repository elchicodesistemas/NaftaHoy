#!/usr/bin/env sh
set -eu

if [ "$#" -ne 2 ] || [ "$2" != "--confirm" ]; then
  echo "Uso: $0 /ruta/al/backup.sql.gz --confirm" >&2
  echo "La restauración reemplaza los datos actuales." >&2
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
  echo "No existe el archivo: $BACKUP_FILE" >&2
  exit 1
fi

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/infrastructure/docker/docker-compose.yml"

gzip -dc "$BACKUP_FILE" | docker compose --env-file "$PROJECT_DIR/infrastructure/docker/.env" -f "$COMPOSE_FILE" exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U naftahoy -d naftahoy

echo "Restauración completada desde: $BACKUP_FILE"
