# Zaoly delivery

Operator pack on **GitHub** that **runs the Zaoly web app** without shipping product source (`apps/`, `knowledge/`, `specs/`, …).

The app itself is the container image **`ghcr.io/chbrdk/zaoly`**. This repo only holds Compose, env, and ops scripts.

| | |
|--|--|
| This delivery repo | [chbrdk/zaoly-delivery](https://github.com/chbrdk/zaoly-delivery) |
| Web app image | `ghcr.io/chbrdk/zaoly:<tag>` |
| Product source (Cursor) | [chris-bordeck/zaoly](https://cursor.com/codebase/chris-bordeck/zaoly) |
| AGPL source mirror / CI | [chbrdk/zaoly](https://github.com/chbrdk/zaoly) |
| Pack SSOT | product `delivery/` → `npm run export:delivery` |

## Install

```bash
cp .env.example .env
chmod 600 .env
# fill AUTH_SECRET, ZAOLY_POSTGRES_PASSWORD, ZAOLY_DATABASE_URL, bootstrap admin, public URLs

docker compose pull
./scripts/up.sh
```

**One-time (owner):** GHCR package **Public** —  
https://github.com/users/chbrdk/packages/container/package/zaoly → Package settings → Change visibility → Public.

Until then:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
```

App: `http://localhost:3000` (or `ZAOLY_HOST_PORT`). Health: `GET /api/health`.

## Update

```bash
docker compose pull
docker compose up -d
```

## Source offer (AGPL)

Corresponding source: [chbrdk/zaoly](https://github.com/chbrdk/zaoly) (same commit/tag as the image when published). Day-to-day development: Cursor Origin product repo.
