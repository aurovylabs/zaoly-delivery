# Zaoly delivery

Operator pack that **runs the Zaoly web app** without shipping product source (`apps/`, `knowledge/`, `specs/`, …).

The app itself is the container image **`ghcr.io/chbrdk/zaoly`** (built from the product `Dockerfile`). This repo only holds Compose, env, and ops scripts that pull and start that image.

| | |
|--|--|
| Web app image | `ghcr.io/chbrdk/zaoly:<tag>` (`paths.deliveryContainerImage`) |
| Product (AGPL source) | [chbrdk/zaoly](https://github.com/chbrdk/zaoly) |
| This delivery repo | [chris-bordeck/zaoly-delivery](https://cursor.com/codebase/chris-bordeck/zaoly-delivery) |
| Pack SSOT in product repo | `delivery/` (export via `npm run export:delivery`) |
| Publish image | Product workflow `Publish delivery image` |

## What this repo contains

- **`docker-compose.yml`** — pulls + runs the **web app image** + Postgres
- `.env.example` — required secrets
- `traefik/zaoly.yml.example` — optional reverse-proxy template
- `VERSION` — default image tag (`latest`)
- `scripts/up.sh` — pull + compose up

## Install

```bash
cp .env.example .env
chmod 600 .env
# fill AUTH_SECRET, ZAOLY_POSTGRES_PASSWORD, ZAOLY_DATABASE_URL, bootstrap admin, public URLs

docker compose pull
./scripts/up.sh
```

If the GHCR package is still private:

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

The running image is covered by AGPL-3.0. Corresponding source: the product repository above (same version / commit as the image tag when published).
