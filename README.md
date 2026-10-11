# Zaoly delivery

Operator pack for running Zaoly **without** the product source tree (`apps/`, `knowledge/`, `specs/`, …).

| | |
|--|--|
| Product (AGPL source) | [chbrdk/zaoly](https://github.com/chbrdk/zaoly) |
| Pack SSOT in product repo | `delivery/` (export via `npm run export:delivery`) |
| Ops matrix | Product knowledge: `zaoly-hosted-vs-self-host.md` · `self-host.md` · `zaoly-delivery-repo.md` |

## What this repo contains

- `docker-compose.yml` — app + Postgres (**image pull**, no build context)
- `.env.example` — required secrets
- `traefik/zaoly.yml.example` — optional reverse-proxy template
- `VERSION` — pinned image tag hint
- `scripts/up.sh` — copy env + compose up

## Prerequisites

- Docker Engine + Compose plugin
- A Zaoly container image available locally or from a registry

Until a public registry tag is published, build once from the product repo and retag:

```bash
# in product clone
docker build -t zaoly:latest .
export ZAOLY_IMAGE=zaoly:latest
```

## Install

```bash
cp .env.example .env
chmod 600 .env
# fill AUTH_SECRET, ZAOLY_POSTGRES_PASSWORD, ZAOLY_DATABASE_URL, bootstrap admin, public URLs
./scripts/up.sh
```

App: `http://localhost:3000` (or `ZAOLY_HOST_PORT`). Health: `GET /api/health`.

## Update

```bash
docker compose pull   # when using a registry image
# or: docker build -t "$ZAOLY_IMAGE" .   # from product repo
docker compose up -d
```

## Source offer (AGPL)

The running image is covered by AGPL-3.0. Corresponding source: the product repository above (same version / commit as the image tag when published).
