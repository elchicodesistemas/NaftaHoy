#!/usr/bin/env sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/infrastructure/docker/docker-compose.yml"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="$BACKUP_DIR/naftahoy-$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"
docker compose --env-file "$PROJECT_DIR/infrastructure/docker/.env" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U naftahoy --clean --if-exists naftahoy | gzip > "$BACKUP_FILE"

echo "Backup creado: $BACKUP_FILE"
