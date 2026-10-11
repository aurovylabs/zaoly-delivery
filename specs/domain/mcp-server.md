# CREATION v3 MCP Server

**Status:** Accepted (Wave 6) — 2026-08-12  
**Implements:** `mcp-server/` (Streamable HTTP + stdio)  
**Knowledge:** `knowledge/mcp-server.md` · `knowledge/paths.md`  
**Auth:** `PLEXON_SERVICE_SECRET` (+ federation contract) for project reads; catalog/composition fixtures are public read  
**Federation:** `2026-05-plexon-federation-v3`

## Purpose

Expose CREATION library / composition / project read APIs as MCP tools for the Plexon assistant (and Cursor). Separate deployable from the web app — same pattern as brandion-v3 / checkion-v3 `mcp-server/`.

## Transport

| Mode | Env | Use |
|------|-----|-----|
| Streamable HTTP (default) | `MCP_PORT` (3102), optional `MCP_STATELESS=1` | Plexon / Coolify / Cursor |
| stdio | `MCP_TRANSPORT=stdio` | Claude Desktop subprocess |

## Env

| Key | Required | Notes |
|-----|----------|-------|
| `CREATION_API_URL` | Yes | Base URL of creation-v3 (e.g. `https://creation-v3.projects-a.plygrnd.tech`) |
| `PLEXON_SERVICE_SECRET` | For projects | Shared federation secret — machine GET on `/api/projects` |
| `CREATION_SERVICE_SECRET` | No | Alias for `PLEXON_SERVICE_SECRET` |
| `PLEXON_FEDERATION_CONTRACT_VERSION` | No | Default `2026-05-plexon-federation-v3` |
| `MCP_TRANSPORT` | No | `stdio` or omit/`http` |
| `MCP_PORT` | No | Default `3102` |
| `MCP_STATELESS` | No | `1` when behind a reverse proxy that drops session headers |

## Tool surface (v1 read-only)

Prefix: `creation.` (Anthropic names: `creation_*` after underscore conversion).

| Tool | Maps to | Notes |
|------|---------|--------|
| `creation.health` | `GET /api/health` | Liveness |
| `creation.library_catalog` | `GET /api/library/catalog` | Offline fixture WC/contract snapshot; optional `q` / `category` filter (product hub SoT = Site Kit) |
| `creation.compositions_list` | `GET /api/compositions` | Scene-store summaries (`CompositionSummary`); session or service+actor; optional `platformProjectId` |
| `creation.projects_list` | `GET /api/projects` | Collection mirrors; service secret when auth configured |
| `creation.project_get` | `GET /api/projects/:id` or `?platformProjectId=` | Detail by local id or Collection id |

## Non-goals (v1)

- Write / delete projects or compositions
- Live CEM / external FS Bridge (retired Zaoly path)
- Host redeem / editor launch tools
- Capability Catalog promote sequences in Plexon (separate)

## Tool surface (v2 write — P90)

**Status:** Accepted (shipped P90) — see `specs/domain/scene-agent-editing.md` · `specs/api/scene-ops.md`. Error bodies MUST be forwarded to the model (`reason`, `failedIndex`, `scene.updatedAt`).

Prefix unchanged: `creation.`. v1 read tools remain stable.

| Tool | Maps to | Auth | Notes |
|------|---------|------|-------|
| `creation.scene_get` | `GET /api/scenes/:id` | Session or service + `X-Plexon-User-Id` | Full `CompositionScene` |
| `creation.scene_list` | `GET /api/scenes?platformProjectId=` | Session or service + user id | List by Collection |
| `creation.scene_tree_index` | `GET /api/scenes/:id/tree` | Session or service + user id | Structural index only |
| `creation.scene_content_audit` | `GET /api/scenes/:id/content-audit` | Session or service + user id | Seed/PDP findings; see `scene-content-audit.md` |
| `creation.scene_preview` | `GET /api/scenes/:id/preview` | Session or service + user id | WebP preview; see `scene-preview.md` |
| `creation.scene_craft_debug` | `GET /api/scenes/:id/craft-debug` | Session or service + user id | Compact craft bundle (flags/stats/designSystem); see `craft-debug.md` |
| `creation.scene_import_html` | `POST /api/scenes/:id/import-html` | Session or service + user id | **Shipped P1** HTML→Site Kit page root; see `html-scene-import.md` |
| `creation.scene_apply_ops` | `POST /api/scenes/:id/ops` | Session or service + user id | `SceneOp[]` batch; requires `baseUpdatedAt` |
| `creation.editor_palette` | `GET /api/editor/palette` | Session or service | Insertable types for planners |
| `creation.brand_tokens_get` | `GET /api/brand-tokens?platformProjectId=` | Session or service | Before `set_token_binding` ops |
| `creation.site_kit_composition_save` | `POST /api/site-kit/compositions` | Session or service + user id | Storybook export; not a `SceneOp` |
| `creation.site_kit_page_save` | `POST /api/site-kit/compositions/from-page` | Session or service + user id | Save page artboard as Pattern; persists bound scene; see `page-as-pattern.md` |
| `creation.scene_publish_magcloud` | `GET scene` → `POST /api/scenes/:id/publish-magcloud` | Session or service + user id | PNG publish to Magcloud board (`boardName` required). Confirm in Plexon. Spec: `magcloud-slide-handoff.md` |

### v2 MCP requirements

1. `creation-client.ts` MUST send `X-Plexon-User-Id` on all v2 mutating tools (tool arg `actorUserId` when not inferable from Plexon session).
2. v2 tools MUST NOT re-implement `applySceneOp` — HTTP proxy only.
3. Tool descriptions MUST link agents to `creation.scene_tree_index` before large `scene_get` loads.
4. `creation.scene_apply_ops` inputSchema MUST embed `baseUpdatedAt` + `ops` array with per-op `op` discriminator docs pointing to `composition-scene.md`.
5. MCP `SCENE_OP_NAMES` MUST include page artboard ops from `scene-pages.md`: `add_page`, `rename_page`, `duplicate_page`, `set_active_page`, `delete_page`, `reorder_pages`, `move_node_to_page` (plus existing node/layout ops). WENN der Nutzer eine **neue Seite** / PDP / Landing verlangt, DANN MUSS der Agent zuerst `add_page` (optional `name`) anwenden — `add_page` setzt `activePageId` auf die neue Page — DANACH Tree/Response lesen (`scene.root.id` / active page root) und erst dann `insert_child` / `insert_instance` unter dem neuen Root. Niemals Layout nur auf der aktuellen Page stapeln, wenn der Intent eine eigene Page war.
6. MCP `SCENE_OP_NAMES` MUST include `bind_master_composition` (Master `sourceKey` = `Composition:{exportName}`) so agents can finish Page→Pattern without a second SSOT.
7. `creation.scene_craft_debug` MUST return a compact bundle (flags, stats, designSystem, spirion meta) — not `importSourceHtml` full text.
8. `creation.site_kit_page_save` MUST persist the bound scene (`upsertScene`) and return `updatedAt` so MCP callers can continue ops without a client-side save.

### v2 non-goals

- Streaming partial scene diffs
- Server undo
- Blind `PUT` scene replacement tool (callers use ops or explicit documented escape hatch)

## Acceptance

1. `npm run build` + `npm test` in `mcp-server/` succeed.
2. Spec inventory lists this file + `knowledge/mcp-server.md`.
3. Coolify Dockerfile under `mcp-server/Dockerfile`; port **3102**.
4. Plexon: `CREATION_MCP_URL` + `specs/domain/assistant-creation-mcp.md`.
