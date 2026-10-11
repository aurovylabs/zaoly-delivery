/**
 * HTTP client for creation-v3 API.
 * Auth: PLEXON_SERVICE_SECRET + federation headers; optional X-Plexon-User-Id for P90 scene tools.
 */

const CONTRACT =
  process.env.PLEXON_FEDERATION_CONTRACT_VERSION?.trim() ||
  '2026-05-plexon-federation-v3'

function creationApiBaseUrl(): string {
  return process.env.CREATION_API_URL?.trim() || ''
}

function serviceSecret(): string {
  return (
    process.env.PLEXON_SERVICE_SECRET?.trim() ||
    process.env.CREATION_SERVICE_SECRET?.trim() ||
    ''
  )
}

export const PLEXON_USER_ID_HEADER = 'X-Plexon-User-Id'
export const CREATION_ACTOR_LABEL_HEADER = 'X-Creation-Actor-Label'
export const PLEXON_SERVICE_SECRET_HEADER = 'X-Service-Secret'
export const PLEXON_CONTRACT_VERSION_HEADER = 'X-Plexon-Contract-Version'

export type CreationFetchOptions = {
  /** Acting user for service writes and audited reads (P90). */
  actorUserId?: string
  actorLabel?: string
}

/**
 * Error envelope returned to MCP tools. Preserves BFF fields (`reason`, `failedIndex`,
 * `scene.updatedAt`, …) so agents can cite rejections and refresh optimistic locks.
 */
export interface CreationFetchError {
  error: true
  message: string
  status?: number
  /** BFF `error` string code when present (e.g. `stale-scene`, `op-rejected`). */
  code?: string
  reason?: string
  failedIndex?: number
  op?: unknown
  scene?: { id?: string; updatedAt?: string }
  [key: string]: unknown
}

export function buildCreationHeaders(
  creation: CreationFetchOptions = {},
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }
  if (serviceSecret()) {
    headers[PLEXON_SERVICE_SECRET_HEADER] = serviceSecret()
    headers[PLEXON_CONTRACT_VERSION_HEADER] = CONTRACT
  }
  const actor = creation.actorUserId?.trim()
  if (actor) {
    headers[PLEXON_USER_ID_HEADER] = actor
  }
  const label = creation.actorLabel?.trim()
  if (label) {
    headers[CREATION_ACTOR_LABEL_HEADER] = label
  }
  return headers
}

export type CreationRequestInit = RequestInit & {
  creation?: CreationFetchOptions
}

function messageFromErrorBody(body: Record<string, unknown>, status: number): string {
  if (typeof body.reason === 'string' && body.reason.trim()) return body.reason.trim()
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail.trim()
  if (typeof body.message === 'string' && body.message.trim()) return body.message.trim()
  if (typeof body.error === 'string' && body.error.trim()) return body.error.trim()
  return `HTTP ${status}`
}

export async function creationFetch<T = unknown>(
  path: string,
  options: CreationRequestInit = {},
): Promise<T | CreationFetchError> {
  if (!creationApiBaseUrl()) {
    return { error: true, message: 'CREATION_API_URL not configured' }
  }
  const { creation, ...fetchOptions } = options
  const base = creationApiBaseUrl()
  const url = path.startsWith('http')
    ? path
    : `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const headers = buildCreationHeaders(creation, fetchOptions.headers as Record<string, string>)
  try {
    const res = await fetch(url, { ...fetchOptions, headers })
    const text = await res.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      return {
        error: true,
        message: res.ok ? text || 'Empty response' : `HTTP ${res.status}: ${text.slice(0, 200)}`,
        status: res.status,
      }
    }
    if (!res.ok) {
      const body =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {}
      const code = typeof body.error === 'string' ? body.error : undefined
      const scene =
        body.scene && typeof body.scene === 'object' && !Array.isArray(body.scene)
          ? (body.scene as { id?: string; updatedAt?: string })
          : undefined
      return {
        ...body,
        error: true,
        code,
        message: messageFromErrorBody(body, res.status),
        status: res.status,
        reason: typeof body.reason === 'string' ? body.reason : undefined,
        failedIndex: typeof body.failedIndex === 'number' ? body.failedIndex : undefined,
        op: body.op,
        scene,
      }
    }
    return data as T
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: true, message: `Request failed: ${message}` }
  }
}

export function isCreationError<T>(r: T | CreationFetchError): r is CreationFetchError {
  return typeof r === 'object' && r !== null && 'error' in r && (r as CreationFetchError).error === true
}
