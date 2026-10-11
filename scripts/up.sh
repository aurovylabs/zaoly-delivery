#!/usr/bin/env bash
# Start Zaoly from the delivery pack (image + Postgres).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  chmod 600 .env
  echo "Created .env from .env.example — fill secrets, then re-run." >&2
  exit 1
fi

TAG="$(tr -d '[:space:]' < VERSION | grep -v '^#' | head -1 || true)"
export ZAOLY_IMAGE_TAG="${ZAOLY_IMAGE_TAG:-${TAG:-latest}}"

echo "==> Pull web app image (ghcr.io/chbrdk/zaoly:${ZAOLY_IMAGE_TAG})"
docker compose --env-file .env pull zaoly
docker compose --env-file .env up -d
echo "Health: curl -sS \"\${NEXT_PUBLIC_ZAOLY_URL:-http://127.0.0.1:\${ZAOLY_HOST_PORT:-3000}}/api/health\""
