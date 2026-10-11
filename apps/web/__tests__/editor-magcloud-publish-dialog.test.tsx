import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { EditorMagcloudPublishDialog } from '../components/editor/editor-magcloud-publish-dialog'
import { paths } from '../lib/paths'

const COLLECTION_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'

vi.mock('../lib/zaoly-ui', () => ({
  Dialog: ({ open, children, title, 'data-testid': testId }: any) =>
    open ? (
      <div data-testid={testId} role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  Field: ({ label, children }: any) => (
    <label>
      <span>{label}</span>
      {children}
    </label>
  ),
  Select: ({
    options,
    value,
    onChange,
    'aria-label': ariaLabel,
    disabled,
    placeholder,
  }: any) => (
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {!value ? <option value="">{placeholder}</option> : null}
      {(options || []).map((o: { value: string; label: string }) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  Input: ({ value, onChange, placeholder, disabled, ...rest }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  ),
  Button: ({ children, onClick, disabled, 'data-testid': testId, type }: any) => (
    <button type={type || 'button'} onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
  Text: ({ children }: any) => <p>{children}</p>,
}))

describe('EditorMagcloudPublishDialog', () => {
  const t = (key: string) => key

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const method = (init?.method || 'GET').toUpperCase()
        if (url.includes(paths.routes.apiProjectsCollections) && method === 'GET') {
          return Response.json({
            items: [{ id: COLLECTION_ID, name: 'Zaoly' }],
          })
        }
        if (url.includes(paths.routes.apiMagcloudBoards) && method === 'GET') {
          return Response.json({
            items: [
              {
                id: 'board-1',
                name: 'Pitch Q4',
                islandKey: 'board1key',
                platformProjectId: COLLECTION_ID,
              },
            ],
          })
        }
        if (url.includes(paths.routes.apiMagcloudBoards) && method === 'POST') {
          return Response.json(
            {
              board: {
                id: 'board-new',
                name: 'New Board',
                islandKey: 'boardnewkey',
                platformProjectId: COLLECTION_ID,
              },
            },
            { status: 201 },
          )
        }
        return Response.json({ error: `unexpected:${method}:${url}` }, { status: 500 })
      }),
    )
  })

  it('creates a board and publishes with islandKey', async () => {
    const onPublish = vi.fn(async () => undefined)
    render(
      <EditorMagcloudPublishDialog
        open
        onClose={() => undefined}
        platformProjectId={COLLECTION_ID}
        sceneName="Slide"
        t={t}
        onPublish={onPublish}
      />,
    )

    expect(screen.getByTestId('editor-magcloud-publish-dialog')).toBeTruthy()

    await waitFor(() => {
      const collectionSelect = screen.getByLabelText(
        'editor.magcloudPublishCollection',
      ) as HTMLSelectElement
      expect(collectionSelect.value).toBe(COLLECTION_ID)
    })

    fireEvent.change(screen.getByPlaceholderText('editor.magcloudPublishNewBoardPlaceholder'), {
      target: { value: 'New Board' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'editor.magcloudPublishCreate' }))

    await waitFor(() => {
      const boardSelect = screen.getByLabelText('editor.magcloudPublishBoard') as HTMLSelectElement
      expect(boardSelect.value).toBe('board-new')
    })

    fireEvent.click(screen.getByTestId('editor-magcloud-publish-confirm'))

    await waitFor(() => {
      expect(onPublish).toHaveBeenCalledWith({
        platformProjectId: COLLECTION_ID,
        boardName: 'boardnewkey',
        boardLabel: 'New Board',
      })
    })
  })

  it('lists existing boards and publishes with islandKey', async () => {
    const onPublish = vi.fn(async () => undefined)
    render(
      <EditorMagcloudPublishDialog
        open
        onClose={() => undefined}
        platformProjectId={COLLECTION_ID}
        t={t}
        onPublish={onPublish}
      />,
    )

    await waitFor(() => {
      const boardSelect = screen.getByLabelText('editor.magcloudPublishBoard') as HTMLSelectElement
      expect(boardSelect.value).toBe('board-1')
    })

    fireEvent.click(screen.getByTestId('editor-magcloud-publish-confirm'))

    await waitFor(() => {
      expect(onPublish).toHaveBeenCalledWith({
        platformProjectId: COLLECTION_ID,
        boardName: 'board1key',
        boardLabel: 'Pitch Q4',
      })
    })
  })
})
