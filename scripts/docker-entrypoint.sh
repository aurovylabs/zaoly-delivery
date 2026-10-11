#!/bin/sh
set -e

if [ -n "$PLEXON_AUTH_URL" ] && [ -n "$PLEXON_SERVICE_SECRET" ]; then
  if [ -z "$AUTH_SECRET" ] || [ "${#AUTH_SECRET}" -lt 32 ]; then
    echo "[CREATION-v3] AUTH_SECRET is missing or shorter than 32 chars while Plexon auth is configured. Refusing to start."
    exit 1
  fi
fi

# Coolify injects HOSTNAME; Next.js binds to it. Force all-interfaces listen.
# Operator: knowledge/coolify-operator-handoff.md · paths PORT 3009.
# Runtime must ship apps/web/lib/paths.ts — next.config.ts imports it at start
# (knowledge/coolify-docker-runtime.md).
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3009}"
echo "[CREATION-v3] starting next (PORT=$PORT HOSTNAME=$HOSTNAME)"
cd /workspace/creation-v3/apps/web
exec npx --no-install next start -H 0.0.0.0 -p "$PORT"
