# Zaoly delivery

Operator pack: **run** Zaoly without cloning the product source tree.

| You want to… | Go here |
|--------------|---------|
| **Develop / fork / change the app** | [chbrdk/zaoly](https://github.com/chbrdk/zaoly) · [CONTRIBUTING.md](https://github.com/chbrdk/zaoly/blob/main/CONTRIBUTING.md) |
| **Just run an instance** | This repo |

The web app binary is **`ghcr.io/chbrdk/zaoly`**. This repo is Compose + env + `up.sh` only.

| | |
|--|--|
| Delivery | [chbrdk/zaoly-delivery](https://github.com/chbrdk/zaoly-delivery) |
| Product (source, public) | [chbrdk/zaoly](https://github.com/chbrdk/zaoly) |
| Image | `ghcr.io/chbrdk/zaoly:<tag>` |

## Install (run)

```bash
cp .env.example .env
chmod 600 .env
# fill AUTH_SECRET, ZAOLY_POSTGRES_PASSWORD, ZAOLY_DATABASE_URL, bootstrap admin, public URLs

docker compose pull
./scripts/up.sh
```

**Owner once:** set GHCR package **Public** —  
https://github.com/users/chbrdk/packages/container/package/zaoly → Package settings → Change visibility → Public  
(until then: `docker login ghcr.io` with `read:packages`).

App: `http://localhost:3000` (or `ZAOLY_HOST_PORT`). Health: `GET /api/health`.

## Update

```bash
docker compose pull
docker compose up -d
```

## Source offer (AGPL)

Corresponding source: [chbrdk/zaoly](https://github.com/chbrdk/zaoly) (same commit/tag as the image).
