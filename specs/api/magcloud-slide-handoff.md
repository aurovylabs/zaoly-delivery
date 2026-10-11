# API — Magcloud slide publish (CREATION BFF)

**Status:** Accepted · **Date:** 2026-10-02  
**Domain:** `specs/domain/magcloud-slide-handoff.md`  
**Suite:** `plexon-v3/specs/domain/creation-magcloud-handoff.md`  
**Upstream:** Magcloud `POST /api/decks/creation/deliver` · `magcloud/slide-universe/specs/api/creation-deliver.md`  
**Path helper:** `paths.routes.apiScenePublishMagcloud(id)` → `/api/scenes/:id/publish-magcloud`

## Auth

Same session / scene access gate as `POST /api/scenes/:id/export`, plus Collection ACL on `scene.platformProjectId`.

Server-side Magcloud call uses federation write secret (`X-Magcloud-Write-Secret` / `X-Service-Secret`). Never expose Magcloud bridge secrets to the browser.

## Env

| Key | Role |
|-----|------|
| `MAGCLOUD_UNIVERSE_URL` | Preferred Magcloud Universe origin (server) for deliver |
| `NEXT_PUBLIC_MAGCLOUD_UNIVERSE_URL` | Fallback public Universe origin |
| `MAGCLOUD_API_URL` | Magcloud **shell** origin for board catalog (`/api/projects/:id/boards`) |
| `NEXT_PUBLIC_MAGCLOUD_URL` | Fallback shell public origin |
| `MAGCLOUD_WRITE_SECRET` | Preferred Magcloud write secret (matches Universe) |
| `PLEXON_SERVICE_SECRET` | Federation + Magcloud service+actor board catalog; fallback write secret |

Documented in `knowledge/paths.md` · `apps/web/lib/runtime-config.ts` (`magcloudUniverseApiUrl`, `magcloudApiUrl`).

## Board catalog (CREATION BFF)

| Method | Path | Body / query | Role |
|--------|------|--------------|------|
| `GET` | `/api/magcloud/boards` | `?platformProjectId=` | List Magcloud shell boards for Collection |
| `POST` | `/api/magcloud/boards` | `{ platformProjectId, name, collectionName? }` | Ensure Collection binding + create board |

Path helper: `paths.routes.apiMagcloudBoards`. Upstream Magcloud: session **or** service secret + `X-Plexon-User-Id`.

## `POST /api/scenes/:id/publish-magcloud`

### Request

```json
{
  "scene": { /* CompositionScene; id MUST equal :id; platformProjectId required */ },
  "boardName": "Pitch_Board",
  "title": "optional slide title",
  "pageId": "optional; defaults to active page",
  "intent": "publish"
}
```

- `boardName` required — Magcloud board **`islandKey`** (from board picker), sanitized server-side.
- `intent` default `publish`. Wave 1 UI sends `publish` only; `autosync` reserved.
- Does **not** load stored scene — client supplies current tree (same as surface export).
- UI picks Collection + Board via dialog (`EditorMagcloudPublishDialog`); free-text `window.prompt` is not used.

### Responses

| Status | Body |
|--------|------|
| 201 | `{ "ok": true, "boardName", "src", "slideIndex", "creation": { "source": "creation_scene", "sceneId", "pageId", "platformProjectId" } }` |
| 400 | `{ "error": string }` invalid body / id mismatch / missing board / missing Collection |
| 401 | `{ "error": "unauthorized" }` |
| 403 | Collection ACL deny |
| 422 | Export/render validation (e.g. no page) |
| 502 | Magcloud unreachable |
| 503 | `{ "error": "magcloud_unconfigured" \| "service_secret_missing" }` |

### Notes

- Renders PNG via surface-export helper (`scale: 2`, active page), then multipart POSTs to Magcloud.
- Explicit publish only — no dirty autosave fan-out.
- Magcloud owns **Edit in Creation** return path (`creation_scene` provenance).
