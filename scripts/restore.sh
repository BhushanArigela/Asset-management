#!/usr/bin/env bash
# ==============================================================================
# Sheraton Asset Management - Restore Script
# Restores:
#   1. Database dump into PostgreSQL
#   2. User Uploaded Files (public/uploads)
#   3. .env configuration (optional/prompted)
# Usage:
#   ./scripts/restore.sh ./backups/full_backup_YYYYMMDD_HHMMSS.tar.gz
# ==============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-full_backup_archive.tar.gz>"
  exit 1
fi

ARCHIVE_PATH="$1"
if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Error: Archive file '${ARCHIVE_PATH}' does not exist!"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMP_DIR="$(mktemp -d)"

trap 'rm -rf "${TEMP_DIR}"' EXIT

echo "=================================================="
echo "Starting Restore Process"
echo "Archive: ${ARCHIVE_PATH}"
echo "Project Root: ${PROJECT_ROOT}"
echo "=================================================="

# Extract archive
echo "--> Extracting backup archive..."
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_DIR}"

BACKUP_SUBDIR="$(find "${TEMP_DIR}" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [ -z "${BACKUP_SUBDIR}" ]; then
  BACKUP_SUBDIR="${TEMP_DIR}"
fi

# 1. Restore Uploaded Files
UPLOADS_TAR="$(find "${BACKUP_SUBDIR}" -name "uploads_*.tar.gz" | head -n 1 || true)"
if [ -n "${UPLOADS_TAR}" ] && [ -f "${UPLOADS_TAR}" ]; then
  echo "--> Restoring uploaded files to ${PROJECT_ROOT}/public/uploads..."
  mkdir -p "${PROJECT_ROOT}/public"
  tar -xzf "${UPLOADS_TAR}" -C "${PROJECT_ROOT}/public"
  echo "    Uploads restored successfully."
fi

# 2. Database Restore
DB_DUMP="$(find "${BACKUP_SUBDIR}" -name "db_dump_*.sql.gz" | head -n 1 || true)"
if [ -n "${DB_DUMP}" ] && [ -f "${DB_DUMP}" ]; then
  echo "--> Found database dump: $(basename "${DB_DUMP}")"
  
  if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    source <(grep -v '^#' "${PROJECT_ROOT}/.env" | grep -v '^$') || true
    set +a
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "Error: DATABASE_URL not found in ${PROJECT_ROOT}/.env!"
    echo "Please configure DATABASE_URL to restore the database."
    exit 1
  fi

  echo "WARNING: Restoring will overwrite existing data in the database!"
  read -r -p "Are you sure you want to proceed with DB restore? (y/N): " CONFIRM
  if [[ "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "--> Restoring database from dump..."
    gunzip -c "${DB_DUMP}" | psql "${DATABASE_URL}"
    echo "    Database restored successfully."
  else
    echo "    Skipping database restore by user request."
  fi
fi

# 3. .env File Info
ENV_BACKUP="$(find "${BACKUP_SUBDIR}" -name ".env.backup" | head -n 1 || true)"
if [ -n "${ENV_BACKUP}" ] && [ -f "${ENV_BACKUP}" ]; then
  echo "--> Note: .env backup is available in the archive if needed."
  if [ ! -f "${PROJECT_ROOT}/.env" ]; then
    cp "${ENV_BACKUP}" "${PROJECT_ROOT}/.env"
    echo "    Created missing ${PROJECT_ROOT}/.env from backup."
  fi
fi

echo "=================================================="
echo "Restore Process Finished!"
echo "=================================================="
