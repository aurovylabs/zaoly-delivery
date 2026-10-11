import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCreationHeaders,
  creationFetch,
  isCreationError,
  CREATION_ACTOR_LABEL_HEADER,
  PLEXON_CONTRACT_VERSION_HEADER,
  PLEXON_SERVICE_SECRET_HEADER,
  PLEXON_USER_ID_HEADER,
} from './creation-client.js'
import { CREATION_TOOL_NAMES, CREATION_V1_TOOL_NAMES } from './tools.js'
import { CREATION_V2_TOOL_NAMES, SCENE_OP_NAMES, compactCraftDebugPayload, compactPageSavePayload } from './tools-v2.js'

describe('creation MCP tool inventory', () => {
  it('exports a unique tool list with creation. prefix', () => {
    assert.ok(CREATION_TOOL_NAMES.length >= 12)
    const set = new Set(CREATION_TOOL_NAMES)
    assert.equal(set.size, CREATION_TOOL_NAMES.length)
    for (const name of CREATION_TOOL_NAMES) {
      assert.ok(name.startsWith('creation.'), name)
    }
  })

  it('includes health, library, compositions, and projects tools', () => {
    for (const required of CREATION_V1_TOOL_NAMES) {
      assert.ok(CREATION_TOOL_NAMES.includes(required), required)
    }
  })

  it('includes P90 v2 scene tools', () => {
    for (const required of CREATION_V2_TOOL_NAMES) {
      assert.ok(CREATION_TOOL_NAMES.includes(required), required)
    }
    assert.ok(CREATION_TOOL_NAMES.includes('creation.scene_apply_ops'))
    assert.ok(CREATION_TOOL_NAMES.includes('creation.scene_tree_index'))
    assert.ok(CREATION_TOOL_NAMES.includes('creation.scene_craft_debug'))
    assert.ok(CREATION_TOOL_NAMES.includes('creation.site_kit_page_save'))
    assert.ok(CREATION_TOOL_NAMES.includes('creation.scene_publish_magcloud'))
  })

  it('allows page artboard ops on scene_apply_ops', () => {
    for (const op of [
      'add_page',
      'rename_page',
      'duplicate_page',
      'set_active_page',
      'delete_page',
      'reorder_pages',
      'move_node_to_page',
      'bind_master_composition',
    ] as const) {
      assert.ok((SCENE_OP_NAMES as readonly string[]).includes(op), op)
    }
  })

  it('coerces stringified ops JSON for scene_apply_ops schema', async () => {
    const { z } = await import('zod')
    // Mirror tools-v2 preprocess: string → array
    const coerce = (value: unknown): unknown => {
      if (Array.isArray(value)) return value
      if (typeof value !== 'string') return value
      try {
        const parsed = JSON.parse(value.trim()) as unknown
        return Array.isArray(parsed) ? parsed : value
      } catch {
        return value
      }
    }
    const field = z.preprocess(
      coerce,
      z.array(z.object({ op: z.string() }).passthrough()).min(1).max(64),
    )
    const ops = [{ op: 'insert_child', parentId: 'root', child: { id: 'p', type: 'PrintPage' } }]
    const parsed = field.safeParse(JSON.stringify(ops))
    assert.equal(parsed.success, true)
    if (parsed.success) assert.deepEqual(parsed.data, ops)
  })
})

describe('compact MCP payloads', () => {
  it('strips import HTML from craft-debug', () => {
    const compact = compactCraftDebugPayload({
      sceneId: 's1',
      pageId: 'p1',
      updatedAt: 't',
      bundle: {
        craftFlags: ['craft-thin'],
        sceneStats: { nodeCount: 12 },
        designSystem: { colors: ['#111', '#222'], fonts: ['Fraunces'] },
        spirion: { captureIds: ['cap_1'] },
      },
      importSourceHtmlPreview: '<html>huge</html>',
    }) as { craftFlags: string[]; importSourceHtmlPreview?: string }
    assert.deepEqual(compact.craftFlags, ['craft-thin'])
    assert.equal(compact.importSourceHtmlPreview, undefined)
  })

  it('omits full scene from page-save', () => {
    const compact = compactPageSavePayload({
      ok: true,
      sceneId: 's1',
      updatedAt: '2026-09-13T00:00:00.000Z',
      exportName: 'Home',
      masterId: 'm1',
      scene: { id: 's1', root: { id: 'root' }, updatedAt: '2026-09-13T00:00:00.000Z' },
    }) as { exportName: string; scene?: unknown; updatedAt: string }
    assert.equal(compact.exportName, 'Home')
    assert.equal(compact.updatedAt, '2026-09-13T00:00:00.000Z')
    assert.equal(compact.scene, undefined)
  })
})

describe('creationFetch headers', () => {
  const prevSecret = process.env.PLEXON_SERVICE_SECRET

  it('forwards federation and actor headers when secret is set', () => {
    process.env.PLEXON_SERVICE_SECRET = 'test-secret'
    const headers = buildCreationHeaders({
      actorUserId: 'user-42',
      actorLabel: 'plexon-assistant',
    })
    assert.equal(headers[PLEXON_SERVICE_SECRET_HEADER], 'test-secret')
    assert.equal(headers[PLEXON_CONTRACT_VERSION_HEADER], '2026-05-plexon-federation-v3')
    assert.equal(headers[PLEXON_USER_ID_HEADER], 'user-42')
    assert.equal(headers[CREATION_ACTOR_LABEL_HEADER], 'plexon-assistant')
    if (prevSecret === undefined) delete process.env.PLEXON_SERVICE_SECRET
    else process.env.PLEXON_SERVICE_SECRET = prevSecret
  })
})

describe('creationFetch error passthrough', () => {
  const prevUrl = process.env.CREATION_API_URL
  const prevFetch = globalThis.fetch

  it('keeps BFF reason, failedIndex, and scene.updatedAt on 409', async () => {
    process.env.CREATION_API_URL = 'https://creation.test'
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          error: 'stale-scene',
          message: 'Scene was updated elsewhere',
          reason: 'baseUpdatedAt mismatch',
          scene: { id: 'scene-1', updatedAt: '2026-09-09T12:00:00.000Z' },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      )) as typeof fetch

    const res = await creationFetch('/api/scenes/scene-1/ops', { method: 'POST', body: '{}' })
    assert.equal(isCreationError(res), true)
    if (isCreationError(res)) {
      assert.equal(res.status, 409)
      assert.equal(res.code, 'stale-scene')
      assert.equal(res.reason, 'baseUpdatedAt mismatch')
      assert.equal(res.scene?.updatedAt, '2026-09-09T12:00:00.000Z')
      assert.match(res.message, /mismatch|elsewhere|stale/i)
    }

    globalThis.fetch = prevFetch
    if (prevUrl === undefined) delete process.env.CREATION_API_URL
    else process.env.CREATION_API_URL = prevUrl
  })
})
