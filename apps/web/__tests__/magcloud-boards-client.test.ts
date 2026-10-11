import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createMagcloudBoard,
  listMagcloudBoardsForCollection,
  magcloudBoardsApiPath,
} from '../lib/magcloud/magcloud-boards-client'

vi.mock('../lib/runtime-config', () => ({
  magcloudApiUrl: () => 'https://magcloud.test',
  getServiceSecret: () => 'test-service-secret-at-least-32-chars!!',
}))

vi.mock('../lib/federation-contract', () => ({
  getFederationContractHeaders: () => ({
    'X-Service-Secret': 'test-service-secret-at-least-32-chars!!',
    'X-Federation-Contract-Version': '2026-05-zaoly-federation-v3',
  }),
}))

describe('magcloud-boards-client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exposes BFF path helper', () => {
    expect(magcloudBoardsApiPath()).toBe('/api/magcloud/boards')
  })

  it('lists boards with service + actor headers', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'b1',
              name: 'Pitch',
              islandKey: 'b1key',
              platformProjectId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            },
          ],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listMagcloudBoardsForCollection(
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      'user-1',
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.items[0]?.islandKey).toBe('b1key')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://magcloud.test/api/projects/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/boards',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-Actor-User-Id': 'user-1',
        }),
      }),
    )
  })

  it('creates a board after ensuring Collection binding', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/api/projects/open-collection')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          board: {
            id: 'b2',
            name: 'New',
            islandKey: 'b2key',
            platformProjectId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          },
        }),
        { status: 201 },
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await createMagcloudBoard({
      platformProjectId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      name: 'New',
      collectionName: 'Zaoly',
      actorUserId: 'user-1',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.islandKey).toBe('b2key')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
