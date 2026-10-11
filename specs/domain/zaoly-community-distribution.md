# Zaoly community distribution

**Status:** Accepted — 2026-10-11  
**Product id:** `zaoly`  
**Related:** `zaoly-standalone.md` · `open-source-licensing.md` · internal `knowledge/zaoly-community-distribution.md`

## Intent

Maintain **two surfaces**:

1. **Internal product repo** (Cursor Origin) — full working tree: `knowledge/`, hosted ops (`zaoly.app` / weddy deploy, managed mail, platform-admin seeds), team notes.
2. **Community distribution** (public GitHub) — cloneable AGPL app source so others can **develop, fork, and self-host from zero**, without internal knowledge or hosted-only wiring.

## MUST

1. Community export MUST include a buildable web app (`apps/web`, `packages/*`, lockfile, `Dockerfile`).
2. Community export MUST NOT include `knowledge/`, `tasks/`, `.cursor/`, or hosted-only deploy/mail/Traefik scripts.
3. Community defaults MUST start clean (self-host / localhost) — no `admin@zaoly.app` bootstrap seeds, no weddy VPS paths, no managed SMTP lock as default.
4. Community README MUST explain local `npm run dev` and self-host Compose from zero, describe the product and main features, and use an **editor** screenshot as the primary hero under \`docs/images/\` (sourced from internal \`community/docs/images/\` at export).
5. Export MUST be reproducible via a script in the internal repo (`npm run export:community`).
6. Public README and delivery commits MUST present Zaoly as the product (open-source / self-hostable) — MUST NOT frame the tree as a lesser “community-only” edition.
7. Public tree MUST ship a root \`version\`, \`CHANGELOG.md\`, and clean root scripts (no internal export/weddy tooling). First public release is \`0.1.0\` (\`v0.1.0\` git tag + GitHub Release).
8. Tag \`v*\` on the public remote MUST publish \`ghcr.io/chbrdk/zaoly\` via \`.github/workflows/publish-delivery-image.yml\`.
9. Public Vitest MUST skip knowledge-gated / hosted-default inventory tests when \`knowledge/\` is absent (\`apps/web/lib/test/public-tree.ts\`).

## MUST NOT

1. Treat Compose-only / image-only packs as the community develop surface.
2. Publish internal `knowledge/` to the community remote.
3. Require zaoly.app DNS, weddy Traefik, or `/root/.zaoly-*` secrets to boot the community tree.
4. Market the public repo in README/commit messages as “only the community version.”

## MAY

1. Include `specs/domain` (product contracts) without internal knowledge essays.
2. Include generic `/admin` routes that are env-gated for any self-host (not hosted seeds).
3. Ship a separate prebuilt GHCR image for ops who do not want to build.
