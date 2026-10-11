# AGENTS.md — Zaoly (community)

1. Specs under `specs/domain` before behavior changes when you add features.
2. UI from `@zaoly/ui` via `apps/web/lib/zaoly-ui*.ts` — no MUI.
3. Routes/env via `apps/web/lib/paths.ts` and `runtime-config.ts`.
4. This tree is the **community** distribution: no internal knowledge/, no zaoly.app hosted ops.
5. Default origin is localhost; set `NEXT_PUBLIC_ZAOLY_URL` / `AUTH_URL` for your deploy.
