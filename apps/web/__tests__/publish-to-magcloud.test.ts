import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CompositionScene } from '@zaoly/contracts'
import { __setSurfaceScreenshotForTests } from '../lib/scene/surface-export'
import {
  publishSceneToMagcloud,
  sanitizeMagcloudBoardName,
} from '../lib/magcloud/publish-to-magcloud'
import { paths } from '../lib/paths'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function scene(partial?: Partial<CompositionScene>): CompositionScene {
  return {
    id: 'scene-mag-1',
    name: 'Magcloud Scene',
    version: 1,
    updatedAt: '2026-10-02T12:00:00.000Z',
    platformProjectId: '11111111-1111-4111-8111-111111111111',
    pages: [
      {
        id: 'page-1',
        name: 'One',
        frame: { width: 640, height: 480 },
        root: {
          id: 'root-1',
          type: 'SiteStack',
          children: [{ id: 't1', type: 'SiteText', props: { children: 'One' } }],
        },
      },
    ],
    activePageId: 'page-1',
    root: { id: 'legacy', type: 'SiteStack', children: [] },
    ...partial,
  }
}

describe('sanitizeMagcloudBoardName', () => {
  it('strips pptx and unsafe chars', () => {
    expect(sanitizeMagcloudBoardName('Pitch Deck.pptx')).toBe('Pitch_Deck')
    expect(sanitizeMagcloudBoardName('  ')).toBe('')
  })
})

describe('publishSceneToMagcloud', () => {
  const prevUniverse = process.env.MAGCLOUD_UNIVERSE_URL
  const prevSecret = process.env[paths.envServiceSecret]
  const prevLegacySecret = process.env[paths.envServiceSecretLegacy]

  afterEach(() => {
    __setSurfaceScreenshotForTests(null)
    vi.unstubAllGlobals()
    if (prevUniverse === undefined) delete process.env.MAGCLOUD_UNIVERSE_URL
    else process.env.MAGCLOUD_UNIVERSE_URL = prevUniverse
    if (prevSecret === undefined) delete process.env[paths.envServiceSecret]
    else process.env[paths.envServiceSecret] = prevSecret
    if (prevLegacySecret === undefined) delete process.env[paths.envServiceSecretLegacy]
    else process.env[paths.envServiceSecretLegacy] = prevLegacySecret
  })

  it('returns 400 without board or Collection', async () => {
    expect(await publishSceneToMagcloud({ scene: scene(), boardName: '' })).toMatchObject({
      ok: false,
      status: 400,
      error: 'board_name_required',
    })
    expect(
      await publishSceneToMagcloud({
        scene: scene({ platformProjectId: null }),
        boardName: 'Board',
      }),
    ).toMatchObject({ ok: false, status: 400, error: 'platform_project_required' })
  })

  it('returns 503 when Magcloud URL missing', async () => {
    delete process.env.MAGCLOUD_UNIVERSE_URL
    delete process.env.NEXT_PUBLIC_MAGCLOUD_UNIVERSE_URL
    process.env[paths.envServiceSecret] = 'test-secret'
    const out = await publishSceneToMagcloud({ scene: scene(), boardName: 'Board' })
    expect(out).toMatchObject({ ok: false, status: 503, error: 'magcloud_unconfigured' })
  })

  it('POSTs PNG multipart to Magcloud deliver', async () => {
    process.env.MAGCLOUD_UNIVERSE_URL = 'https://magcloud.test'
    process.env[paths.envServiceSecret] = 'test-secret'
    __setSurfaceScreenshotForTests(async () => TINY_PNG)

    const fetchMock = vi.fn(async () =>
      Response.json({
        ok: true,
        boardName: 'Board',
        src: 'uploads/abc.png',
        slideIndex: 0,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const out = await publishSceneToMagcloud({
      scene: scene(),
      boardName: 'Board',
      title: 'Hero',
    })
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.src).toBe('uploads/abc.png')
    expect(out.creation.sceneId).toBe('scene-mag-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://magcloud.test/api/decks/creation/deliver')
    expect((init.headers as Record<string, string>)['X-Magcloud-Write-Secret']).toBe('test-secret')
    expect(init.body).toBeInstanceOf(FormData)
  })
})
