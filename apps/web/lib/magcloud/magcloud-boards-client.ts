/**
 * CREATION → Magcloud shell board catalog (list / ensure binding / create).
 * Spec: specs/domain/magcloud-slide-handoff.md
 */
import { getFederationContractHeaders } from '../federation-contract'
import { paths } from '../paths'
import { isRealPlatformProjectId } from '../platform-project-id'
import { getServiceSecret, magcloudApiUrl } from '../runtime-config'

export type MagcloudBoardSummary = {
  id: string
  name: string
  islandKey: string
  platformProjectId: string
  status?: string
  updatedAt?: string
}

export type MagcloudBoardsResult =
  | { ok: true; items: MagcloudBoardSummary[] }
  | { ok: false; status: number; error: string }

export type MagcloudCreateBoardResult =
  | { ok: true; board: MagcloudBoardSummary }
  | { ok: false; status: number; error: string }

const ACTOR_USER_ID_HEADER = 'X-Actor-User-Id'

function serviceHeaders(actorUserId: string): HeadersInit {
  const secret = getServiceSecret()
  return {
    ...getFederationContractHeaders(secret),
    [ACTOR_USER_ID_HEADER]: actorUserId,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

function boardsPath(platformProjectId: string): string {
  return `/api/projects/${encodeURIComponent(platformProjectId)}/boards`
}

export async function listMagcloudBoardsForCollection(
  platformProjectId: string,
  actorUserId: string,
): Promise<MagcloudBoardsResult> {
  const base = magcloudApiUrl()
  const secret = getServiceSecret()
  if (!base || !secret) {
    return { ok: false, status: 503, error: 'magcloud_unconfigured' }
  }
  try {
    const res = await fetch(`${base}${boardsPath(platformProjectId)}`, {
      method: 'GET',
      headers: serviceHeaders(actorUserId),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    })
    if (res.status === 404) {
      return { ok: true, items: [] }
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, status: res.status, error: body.error || `magcloud_${res.status}` }
    }
    const body = (await res.json()) as { items?: MagcloudBoardSummary[] }
    const items = Array.isArray(body.items) ? body.items : []
    return {
      ok: true,
      items: items.filter(
        (b) =>
          Boolean(b?.id?.trim()) &&
          Boolean(b?.islandKey?.trim()) &&
          isRealPlatformProjectId(b.platformProjectId),
      ),
    }
  } catch (e) {
    return {
      ok: false,
      status: 502,
      error: e instanceof Error ? e.message : 'magcloud_unreachable',
    }
  }
}

export async function ensureMagcloudCollectionBinding(input: {
  platformProjectId: string
  name: string
  actorUserId: string
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const base = magcloudApiUrl()
  const secret = getServiceSecret()
  if (!base || !secret) {
    return { ok: false, status: 503, error: 'magcloud_unconfigured' }
  }
  try {
    const res = await fetch(`${base}/api/projects/open-collection`, {
      method: 'POST',
      headers: serviceHeaders(input.actorUserId),
      body: JSON.stringify({
        platformProjectId: input.platformProjectId,
        name: input.name,
      }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, status: res.status, error: body.error || `magcloud_${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return {
      ok: false,
      status: 502,
      error: e instanceof Error ? e.message : 'magcloud_unreachable',
    }
  }
}

export async function createMagcloudBoard(input: {
  platformProjectId: string
  name: string
  collectionName: string
  actorUserId: string
}): Promise<MagcloudCreateBoardResult> {
  const ensured = await ensureMagcloudCollectionBinding({
    platformProjectId: input.platformProjectId,
    name: input.collectionName,
    actorUserId: input.actorUserId,
  })
  if (!ensured.ok) return ensured

  const base = magcloudApiUrl()
  const secret = getServiceSecret()
  if (!base || !secret) {
    return { ok: false, status: 503, error: 'magcloud_unconfigured' }
  }
  try {
    const res = await fetch(`${base}${boardsPath(input.platformProjectId)}`, {
      method: 'POST',
      headers: serviceHeaders(input.actorUserId),
      body: JSON.stringify({ name: input.name }),
      signal: AbortSignal.timeout(15_000),
    })
    const body = (await res.json().catch(() => ({}))) as {
      error?: string
      board?: MagcloudBoardSummary
    }
    if (!res.ok || !body.board) {
      return { ok: false, status: res.status, error: body.error || `magcloud_${res.status}` }
    }
    return { ok: true, board: body.board }
  } catch (e) {
    return {
      ok: false,
      status: 502,
      error: e instanceof Error ? e.message : 'magcloud_unreachable',
    }
  }
}

/** Path helper for tests / docs. */
export function magcloudBoardsApiPath(): string {
  return paths.routes.apiMagcloudBoards
}
