/**
 * Server-only: export scene PNG and POST to Magcloud creation deliver.
 * Spec: specs/domain/magcloud-slide-handoff.md · suite creation-magcloud-handoff.md
 */
import type { CompositionScene } from '@zaoly/contracts'
import { getServiceSecret, magcloudUniverseApiUrl } from '../runtime-config'
import { paths } from '../paths'
import { resolveActivePageId } from '../scene/scene-pages'
import { renderSurfaceExport, SurfaceExportError } from '../scene/surface-export'

const MAGCLOUD_CREATION_DELIVER_PATH = '/api/decks/creation/deliver'

/** Magcloud write secret prefers dedicated key; falls back to federation secret. */
export function magcloudWriteSecret(): string {
  return (
    process.env[paths.envMagcloudWriteSecret]?.trim() ||
    getServiceSecret() ||
    ''
  )
}

export type PublishMagcloudInput = {
  scene: CompositionScene
  boardName: string
  title?: string
  pageId?: string
  intent?: 'publish' | 'autosync'
}

export type PublishMagcloudOk = {
  ok: true
  boardName: string
  src: string
  slideIndex: number
  creation: {
    source: 'creation_scene'
    sceneId: string
    pageId: string | null
    platformProjectId: string | null
  }
}

export type PublishMagcloudResult = PublishMagcloudOk | { ok: false; status: number; error: string }

export function sanitizeMagcloudBoardName(raw: string): string {
  const base = String(raw || '')
    .replace(/\.pptx$/i, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80)
  return base || ''
}

export async function publishSceneToMagcloud(
  input: PublishMagcloudInput,
): Promise<PublishMagcloudResult> {
  const boardName = sanitizeMagcloudBoardName(input.boardName)
  if (!boardName) return { ok: false, status: 400, error: 'board_name_required' }

  const platformProjectId = String(input.scene.platformProjectId || '').trim()
  if (!platformProjectId) {
    return { ok: false, status: 400, error: 'platform_project_required' }
  }

  const base = magcloudUniverseApiUrl()
  const secret = magcloudWriteSecret()
  if (!base) return { ok: false, status: 503, error: 'magcloud_unconfigured' }
  if (!secret) return { ok: false, status: 503, error: 'service_secret_missing' }

  const pageId =
    String(input.pageId || '').trim() ||
    resolveActivePageId(input.scene.pages ?? [], input.scene.activePageId)

  let png: Buffer
  try {
    const exported = await renderSurfaceExport(input.scene, {
      format: 'png',
      scope: 'active',
      pageIds: pageId ? [pageId] : undefined,
      breakpoint: input.scene.activeBreakpoint,
      scale: 2,
    })
    png = exported.bytes
  } catch (e) {
    if (e instanceof SurfaceExportError) {
      return { ok: false, status: e.code === 'render_failed' ? 500 : 422, error: e.message }
    }
    return {
      ok: false,
      status: 500,
      error: e instanceof Error ? e.message : 'export_failed',
    }
  }

  const fd = new FormData()
  fd.append('file', new Blob([new Uint8Array(png)], { type: 'image/png' }), `${boardName}.png`)
  fd.append('boardName', boardName)
  fd.append('fileName', `${boardName}.png`)
  fd.append('sceneId', input.scene.id)
  fd.append('pageId', pageId)
  fd.append('platformProjectId', platformProjectId)
  fd.append('intent', input.intent === 'autosync' ? 'autosync' : 'publish')
  if (input.title?.trim()) fd.append('title', input.title.trim())

  try {
    const res = await fetch(`${base}${MAGCLOUD_CREATION_DELIVER_PATH}`, {
      method: 'POST',
      headers: {
        'X-Magcloud-Write-Secret': secret,
        'X-Service-Secret': secret,
      },
      body: fd,
      signal: AbortSignal.timeout(120_000),
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      boardName?: string
      src?: string
      slideIndex?: number
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || `magcloud_${res.status}`,
      }
    }
    return {
      ok: true,
      boardName: data.boardName || boardName,
      src: data.src || '',
      slideIndex: typeof data.slideIndex === 'number' ? data.slideIndex : 0,
      creation: {
        source: 'creation_scene',
        sceneId: input.scene.id,
        pageId: pageId || null,
        platformProjectId,
      },
    }
  } catch (e) {
    return {
      ok: false,
      status: 502,
      error: e instanceof Error ? e.message : 'magcloud_unreachable',
    }
  }
}
