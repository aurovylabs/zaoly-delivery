# Zaoly (community)

Open AGPL source for the Zaoly design editor. Clone this repo to **develop, fork, and self-host from zero**.

This distribution is **not** the hosted [zaoly.app](https://zaoly.app) operations tree. It has no internal knowledge base and no weddy/zaoly.app deploy wiring.

## Quick start (local)

```bash
npm install
npm run dev
```

Open `http://localhost:3009/editor`.

Optional Postgres (multi-user): see root `docker-compose.yml` / `npm run bootstrap:local-pg` if present, or self-host Compose below.

## Self-host (Docker)

```bash
cp deploy/.env.example deploy/.env
# set AUTH_SECRET, ZAOLY_POSTGRES_PASSWORD, ZAOLY_DATABASE_URL,
# ZAOLY_BOOTSTRAP_ADMIN_EMAIL / PASSWORD, NEXT_PUBLIC_ZAOLY_URL, AUTH_URL
docker compose -f deploy/docker-compose.self-host.yml --env-file deploy/.env up -d --build
```

Bootstrap admin is whatever you put in `.env` — there is no seeded `admin@zaoly.app`.

## License

[AGPL-3.0-only](LICENSE). Network use of a modified version requires offering corresponding source (§13).

## What is intentionally missing

- Internal `knowledge/` and team task notes
- Hosted deploy (weddy Traefik, `mail.zaoly.app` MTA, VPS scripts)
- Desktop / macOS app trees (web-first community pack)
