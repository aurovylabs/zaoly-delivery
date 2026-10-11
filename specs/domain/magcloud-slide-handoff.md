# Magcloud slide handoff — CREATION v3

## Status
**Accepted** — Wave 1 shipped 2026-10-02.

**Suite SSOT:** `plexon-v3/specs/domain/creation-magcloud-handoff.md`  
**Magcloud twin:** `magcloud/slide-universe/specs/domain/creation-slide-consume.md`  
**API:** `specs/api/magcloud-slide-handoff.md`  
**Depends:** `scene-surface-export.md` · `composition-magazine-pdf.md` · `brand-token-consume.md` · `composition-scene.md`

## Goal
From the CREATION editor, **publish** one or more scene artboards into a Magcloud board in the **same Collection** — brand-true frames for the spatial pitch, without autosave flood.

## Wave 1 UX

### Publish to Magcloud (CREATION)
1. Editor action: **Publish to Magcloud** (Export menu — `data-testid="editor-publish-magcloud"`).
2. **Dialog** (not `window.prompt`): pick **Collection** (default = scene `platformProjectId`; may rebind scene), then **Board** from Magcloud catalog for that Collection, or **create a new board** by name.
3. Target Universe file key = Magcloud board `islandKey` (not free-text display name).
4. CREATION renders via existing surface-export pipeline (PNG).
5. CREATION BFF POSTs to Magcloud creation-deliver with `platformProjectId`, `sceneId`, `pageId`, `source: creation_scene`, `intent: publish`.
6. Success → toast with board name; failure → clear error (auth, Collection mismatch, size).

### Board catalog BFF
| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/magcloud/boards?platformProjectId=` | Proxy Magcloud shell boards for Collection (session; CREATION ACL) |
| `POST` | `/api/magcloud/boards` | Ensure Magcloud Collection binding + create board `{ platformProjectId, name }` |

Upstream Magcloud: `GET/POST /api/projects/:platformProjectId/boards` (session **or** service secret + `X-Plexon-User-Id`).

### Edit in Creation (return path — Magcloud owns the button)
Magcloud shows **Edit in Creation** / „In CREATION bearbeiten“ when slide meta has `source: creation_scene` + `sceneId`.  
CREATION MUST accept `/editor?sceneId=&platformProjectId=` (existing `buildEditorLaunchUrl` / `editorHref`). Optional `pageId` focus is Wave 2.  
After edits, user **Publish to Magcloud** again to refresh pixels (no silent Magcloud mutate).

## Rules
1. Scene MUST carry `platformProjectId`; publish without Collection binding is blocked. Dialog may set/rebind Collection before publish.
2. Do not store Magcloud bridge secrets in CREATION; use federation write auth.
3. Do not push Brandion packs or scene JSON as Magcloud SoT in Wave 1 — **pixels + provenance** only.
4. Explicit publish only (no dirty autosave → Magcloud).
5. Do not invent Magcloud→CREATION links for non-provenance slides.
6. Plexon Assistant MAY call MCP publish as secondary; primary UX is this editor dialog.

## Non-goals
- Embedding Magcloud orbit canvas in `/editor`
- Editing Magcloud notes inside CREATION
- Replacing PowerPoint / PA bridge publish
- Teaching the Assistant Magcloud board IA (boards live in CREATION UI)

## Acceptance
Wave 0: this twin + suite SSOT. Wave 1: Export menu + BFF + Magcloud deliver + Edit-in-Creation + tests — **done**.  
Wave 1.1: Board picker dialog + Collection select + create board + `islandKey` publish — **this change**.

