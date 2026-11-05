#!/usr/bin/env bash
# ==============================================================================
# Sheraton Asset Management - Automated Backup Script
# Backs up:
#   1. PostgreSQL Database (via pg_dump)
#   2. User Uploaded Files (public/uploads)
#   3. Environment & Configuration (.env)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
CURRENT_BACKUP="${BACKUP_DIR}/backup_${TIMESTAMP}"
RETENTION_DAYS=14

mkdir -p "${CURRENT_BACKUP}"

echo "=================================================="
echo "Starting Asset Management Backup: ${TIMESTAMP}"
echo "Project Root: ${PROJECT_ROOT}"
echo "Backup Destination: ${CURRENT_BACKUP}"
echo "=================================================="

# 1. Back up .env file
if [ -f "${PROJECT_ROOT}/.env" ]; then
  echo "--> Backing up .env configuration..."
  cp "${PROJECT_ROOT}/.env" "${CURRENT_BACKUP}/.env.backup"
  set -a
  # Source .env without erroring if there are special characters
  source <(grep -v '^#' "${PROJECT_ROOT}/.env" | grep -v '^$') || true
  set +a
fi

# 2. Back up PostgreSQL Database
echo "--> Backing up PostgreSQL Database..."
if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "${DATABASE_URL}" | gzip > "${CURRENT_BACKUP}/db_dump_${TIMESTAMP}.sql.gz"
  echo "    Database dumped successfully to db_dump_${TIMESTAMP}.sql.gz"
else
  DB_NAME="${DB_NAME:-sheraton_assets}"
  DB_USER="${DB_USER:-postgres}"
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${CURRENT_BACKUP}/db_dump_${TIMESTAMP}.sql.gz"
  echo "    Database dumped successfully to db_dump_${TIMESTAMP}.sql.gz"
fi

# 3. Back up Uploaded Files
echo "--> Backing up Uploaded Files (public/uploads)..."
if [ -d "${PROJECT_ROOT}/public/uploads" ]; then
  tar -czf "${CURRENT_BACKUP}/uploads_${TIMESTAMP}.tar.gz" -C "${PROJECT_ROOT}/public" uploads
  echo "    Uploads archived successfully to uploads_${TIMESTAMP}.tar.gz"
else
  echo "    [Notice] public/uploads not found, skipping."
fi

# 4. Package into a single compressed bundle
echo "--> Packaging complete bundle..."
FULL_ARCHIVE="${BACKUP_DIR}/full_backup_${TIMESTAMP}.tar.gz"
tar -czf "${FULL_ARCHIVE}" -C "${BACKUP_DIR}" "backup_${TIMESTAMP}"
rm -rf "${CURRENT_BACKUP}"

echo "=================================================="
echo "Backup Completed Successfully!"
echo "Archive File: ${FULL_ARCHIVE}"
echo "File Size:    $(du -h "${FULL_ARCHIVE}" | cut -f1)"
echo "=================================================="

# 5. Clean up old backups older than RETENTION_DAYS
echo "--> Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "full_backup_*.tar.gz" -type f -mtime +"${RETENTION_DAYS}" -delete 2>/dev/null || true
echo "Done."
