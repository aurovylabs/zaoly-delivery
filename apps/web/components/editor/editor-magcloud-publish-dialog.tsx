'use client'

/**
 * Magcloud publish target picker — Collection + Board (+ create).
 * Spec: specs/domain/magcloud-slide-handoff.md
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Dialog, Field, Input, Select, Text } from '../../lib/zaoly-ui'
import { paths } from '../../lib/paths'
import { isRealPlatformProjectId } from '../../lib/platform-project-id'
import type { Translator } from '../../lib/i18n'

export type MagcloudPublishBoard = {
  id: string
  name: string
  islandKey: string
  platformProjectId: string
}

export type MagcloudPublishCollection = {
  id: string
  name: string
}

export type EditorMagcloudPublishDialogProps = {
  open: boolean
  onClose: () => void
  /** Scene / default Collection. */
  platformProjectId?: string | null
  sceneName?: string | null
  busy?: boolean
  /** Publish failure from parent (dialog stays open). */
  publishError?: string | null
  t: Translator
  onPublish: (input: {
    platformProjectId: string
    boardName: string
    boardLabel: string
  }) => Promise<void>
}

function rememberedBoardKey(platformProjectId: string): string {
  return `creation.magcloudBoardId.${platformProjectId}`
}

function mapMagcloudUiError(raw: string | undefined, fallback: string, t: Translator): string {
  const code = String(raw || '').trim()
  if (!code) return fallback
  if (code === 'magcloud_unconfigured' || code === 'service_secret_missing') {
    return t('editor.magcloudPublishUnconfigured')
  }
  if (code === 'magcloud_unreachable' || code.startsWith('magcloud_5')) {
    return t('editor.magcloudPublishUpstreamFailed')
  }
  if (code === 'platform_project_required' || code === 'not_found' || code === 'collection_not_bound') {
    return t('editor.magcloudPublishNeedCollection')
  }
  // Avoid dumping opaque machine codes as the only message.
  if (/^[a-z0-9_]+$/i.test(code) && !code.includes(' ')) {
    return fallback
  }
  return code
}

function normalizeBoard(row: MagcloudPublishBoard | null | undefined): MagcloudPublishBoard | null {
  if (!row) return null
  const id = String(row.id || '').trim()
  const islandKey = String(row.islandKey || '').trim()
  const platformProjectId = String(row.platformProjectId || '').trim()
  const name = String(row.name || islandKey || id).trim()
  if (!id || !islandKey || !isRealPlatformProjectId(platformProjectId)) return null
  return { id, name, islandKey, platformProjectId }
}

export function EditorMagcloudPublishDialog({
  open,
  onClose,
  platformProjectId,
  sceneName,
  busy = false,
  publishError = null,
  t,
  onPublish,
}: EditorMagcloudPublishDialogProps) {
  const [collections, setCollections] = useState<MagcloudPublishCollection[]>([])
  const [boards, setBoards] = useState<MagcloudPublishBoard[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [boardId, setBoardId] = useState('')
  const [newBoardName, setNewBoardName] = useState('')
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingBoards, setLoadingBoards] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const boardsRequestId = useRef(0)
  const collectionsAbort = useRef<AbortController | null>(null)
  const boardsAbort = useRef<AbortController | null>(null)

  const selectedBoard = useMemo(
    () => boards.find((b) => b.id === boardId) ?? null,
    [boards, boardId],
  )
  const selectedCollection = useMemo(
    () => collections.find((c) => c.id === collectionId) ?? null,
    [collections, collectionId],
  )

  const displayError = error || publishError

  const loadCollections = useCallback(async () => {
    collectionsAbort.current?.abort()
    const ac = new AbortController()
    collectionsAbort.current = ac
    setLoadingCollections(true)
    setError(null)
    try {
      const res = await fetch(paths.routes.apiProjectsCollections, { signal: ac.signal })
      const body = (await res.json().catch(() => ({}))) as {
        items?: { id?: string; platformProjectId?: string; name?: string }[]
        error?: string
      }
      if (ac.signal.aborted) return
      if (!res.ok) {
        setError(
          mapMagcloudUiError(body.error, t('editor.magcloudPublishCollectionsFailed'), t),
        )
        setCollections([])
        return
      }
      const items = (body.items || [])
        .map((row) => {
          const id = String(row.id || row.platformProjectId || '').trim()
          const name = String(row.name || id).trim()
          if (!id || !isRealPlatformProjectId(id)) return null
          return { id, name }
        })
        .filter(Boolean) as MagcloudPublishCollection[]
      setCollections(items)
      const preferred = platformProjectId?.trim() || ''
      const next =
        (preferred && items.some((c) => c.id === preferred) && preferred) ||
        items[0]?.id ||
        ''
      setCollectionId(next)
      if (!items.length) {
        setError(t('editor.magcloudPublishNeedCollection'))
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setError(t('editor.magcloudPublishCollectionsFailed'))
      setCollections([])
    } finally {
      if (!ac.signal.aborted) setLoadingCollections(false)
    }
  }, [platformProjectId, t])

  const loadBoards = useCallback(
    async (ppid: string) => {
      boardsAbort.current?.abort()
      if (!ppid || !isRealPlatformProjectId(ppid)) {
        setBoards([])
        setBoardId('')
        return
      }
      const ac = new AbortController()
      boardsAbort.current = ac
      const requestId = ++boardsRequestId.current
      setLoadingBoards(true)
      setError(null)
      try {
        const url = `${paths.routes.apiMagcloudBoards}?platformProjectId=${encodeURIComponent(ppid)}`
        const res = await fetch(url, { signal: ac.signal })
        const body = (await res.json().catch(() => ({}))) as {
          items?: MagcloudPublishBoard[]
          error?: string
        }
        if (ac.signal.aborted || requestId !== boardsRequestId.current) return
        if (!res.ok) {
          setError(mapMagcloudUiError(body.error, t('editor.magcloudPublishBoardsFailed'), t))
          setBoards([])
          setBoardId('')
          return
        }
        const items = (Array.isArray(body.items) ? body.items : [])
          .map((row) => normalizeBoard(row))
          .filter(Boolean) as MagcloudPublishBoard[]
        setBoards(items)
        let remembered = ''
        try {
          remembered = window.localStorage.getItem(rememberedBoardKey(ppid)) || ''
        } catch {
          remembered = ''
        }
        const pick =
          (remembered && items.some((b) => b.id === remembered) && remembered) ||
          items[0]?.id ||
          ''
        setBoardId(pick)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        if (requestId !== boardsRequestId.current) return
        setError(t('editor.magcloudPublishBoardsFailed'))
        setBoards([])
        setBoardId('')
      } finally {
        if (!ac.signal.aborted && requestId === boardsRequestId.current) {
          setLoadingBoards(false)
        }
      }
    },
    [t],
  )

  useEffect(() => {
    if (!open) {
      collectionsAbort.current?.abort()
      boardsAbort.current?.abort()
      setPublishing(false)
      setCreating(false)
      setError(null)
      setNewBoardName('')
      return
    }
    void loadCollections()
  }, [open, loadCollections])

  useEffect(() => {
    if (!open || !collectionId) return
    void loadBoards(collectionId)
  }, [open, collectionId, loadBoards])

  async function handleCreateBoard() {
    const name = newBoardName.trim()
    if (!name || !collectionId || creating || busy || publishing) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(paths.routes.apiMagcloudBoards, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          platformProjectId: collectionId,
          name,
          collectionName: selectedCollection?.name || sceneName || name,
        }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        board?: MagcloudPublishBoard
        error?: string
      }
      if (!res.ok || !body.board) {
        setError(mapMagcloudUiError(body.error, t('editor.magcloudPublishCreateFailed'), t))
        return
      }
      const board = normalizeBoard(body.board)
      if (!board) {
        setError(t('editor.magcloudPublishCreateFailed'))
        return
      }
      setNewBoardName('')
      setBoards((prev) => [board, ...prev.filter((b) => b.id !== board.id)])
      setBoardId(board.id)
    } catch {
      setError(t('editor.magcloudPublishCreateFailed'))
    } finally {
      setCreating(false)
    }
  }

  async function handlePublish() {
    if (!selectedBoard || !collectionId || busy || creating || publishing) return
    setError(null)
    setPublishing(true)
    try {
      try {
        window.localStorage.setItem(rememberedBoardKey(collectionId), selectedBoard.id)
        window.localStorage.setItem('creation.magcloudBoardName', selectedBoard.islandKey)
      } catch {
        /* ignore */
      }
      await onPublish({
        platformProjectId: collectionId,
        boardName: selectedBoard.islandKey,
        boardLabel: selectedBoard.name,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('editor.magcloudPublishFailed'))
    } finally {
      setPublishing(false)
    }
  }

  const collectionOptions = collections.map((c) => ({ value: c.id, label: c.name }))
  const boardOptions = boards.map((b) => ({ value: b.id, label: b.name }))
  const locked = busy || creating || publishing
  const canPublish = Boolean(selectedBoard && collectionId && !locked && !loadingBoards)

  return (
    <Dialog
      open={open}
      onClose={locked ? () => undefined : onClose}
      title={t('editor.magcloudPublishDialogTitle')}
      data-testid="editor-magcloud-publish-dialog"
    >
      <div style={{ display: 'grid', gap: '1rem', minWidth: 'min(28rem, 92vw)' }}>
        <Text role="body">{t('editor.magcloudPublishDialogHint')}</Text>

        <Field label={t('editor.magcloudPublishCollection')}>
          <Select
            aria-label={t('editor.magcloudPublishCollection')}
            options={collectionOptions}
            value={collectionId}
            onChange={setCollectionId}
            disabled={locked || loadingCollections || collectionOptions.length === 0}
            placeholder={
              loadingCollections
                ? t('editor.magcloudPublishLoading')
                : t('editor.magcloudPublishCollectionPlaceholder')
            }
          />
        </Field>

        <Field label={t('editor.magcloudPublishBoard')}>
          <Select
            aria-label={t('editor.magcloudPublishBoard')}
            options={boardOptions}
            value={boardId}
            onChange={setBoardId}
            disabled={locked || loadingBoards || !collectionId}
            placeholder={
              loadingBoards
                ? t('editor.magcloudPublishLoading')
                : boardOptions.length
                  ? t('editor.magcloudPublishBoardPlaceholder')
                  : t('editor.magcloudPublishNoBoards')
            }
          />
        </Field>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <Text role="meta">{t('editor.magcloudPublishCreateBoard')}</Text>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Field label={t('editor.magcloudPublishNewBoardName')}>
                <Input
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  disabled={locked || !collectionId}
                  placeholder={t('editor.magcloudPublishNewBoardPlaceholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void handleCreateBoard()
                    }
                  }}
                />
              </Field>
            </div>
            <Button
              type="button"
              variant="subtle"
              disabled={locked || !collectionId || !newBoardName.trim()}
              onClick={() => void handleCreateBoard()}
            >
              {creating ? t('editor.magcloudPublishCreating') : t('editor.magcloudPublishCreate')}
            </Button>
          </div>
        </div>

        {displayError ? (
          <Text role="body" className="creation-magcloud-publish-error" data-testid="editor-magcloud-publish-error">
            {displayError}
          </Text>
        ) : null}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" disabled={locked} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!canPublish}
            data-testid="editor-magcloud-publish-confirm"
            onClick={() => void handlePublish()}
          >
            {busy || publishing ? t('editor.magcloudPublishBusy') : t('editor.magcloudPublishConfirm')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
