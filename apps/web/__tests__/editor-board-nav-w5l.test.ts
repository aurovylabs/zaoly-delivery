import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { CompositionScene, SceneNode } from '@zaoly/contracts'
import { useEditorBoardNav } from '../components/editor/use-editor-board-nav'
import { applySceneOp } from '../lib/scene/ops'

function multiPageScene(): CompositionScene {
  const rootA: SceneNode = { id: 'root-a', type: 'Stack', children: [] }
  const rootB: SceneNode = { id: 'root-b', type: 'Stack', children: [] }
  return {
    id: 's1',
    name: 'Demo',
    version: 1,
    root: rootA,
    activePageId: 'page-a',
    pages: [
      { id: 'page-a', name: 'A', root: rootA, frame: { x: 0, y: 0 } },
      { id: 'page-b', name: 'B', root: rootB, frame: { x: 1200, y: 0 } },
    ],
    updatedAt: '2026-09-12T00:00:00.000Z',
  }
}

describe('useEditorBoardNav (W5l)', () => {
  it('cycleActivePage is a no-op outside scene board mode', () => {
    const present = multiPageScene()
    const pushPresent = vi.fn()
    const { result } = renderHook(() =>
      useEditorBoardNav({
        scene: present,
        sceneRef: { current: present },
        viewportRef: { current: null },
        sceneBoardMode: false,
        editingMasterId: null,
        activeBreakpoint: 'desktop',
        activePrintPreset: 'a4-portrait',
        artboardHeight: 640,
        artboardWidth: 960,
        viewportArtboardHeight: 640,
        commitViewportImmediate: vi.fn(),
        applyMutatingOp: (current, op) => applySceneOp(current, op),
        rejectMutation: vi.fn(),
        pushPresent,
        enqueuePendingOp: vi.fn(),
        setSelectedIds: vi.fn(),
        setError: vi.fn(),
      }),
    )
    act(() => {
      result.current.cycleActivePage(1)
    })
    expect(pushPresent).not.toHaveBeenCalled()
  })

  it('activateBoardPage pushes set_active_page and selects page root', () => {
    const present = multiPageScene()
    const sceneRef = { current: present }
    const pushPresent = vi.fn()
    const enqueuePendingOp = vi.fn()
    const setSelectedIds = vi.fn()
    const { result } = renderHook(() =>
      useEditorBoardNav({
        scene: present,
        sceneRef,
        viewportRef: { current: null },
        sceneBoardMode: true,
        editingMasterId: null,
        activeBreakpoint: 'desktop',
        activePrintPreset: 'a4-portrait',
        artboardHeight: 640,
        artboardWidth: 960,
        viewportArtboardHeight: 640,
        commitViewportImmediate: vi.fn(),
        applyMutatingOp: (current, op) => applySceneOp(current, op),
        rejectMutation: vi.fn(),
        pushPresent,
        enqueuePendingOp,
        setSelectedIds,
        setError: vi.fn(),
      }),
    )
    act(() => {
      result.current.activateBoardPage('page-b')
    })
    expect(pushPresent).toHaveBeenCalledTimes(1)
    const [, ops] = pushPresent.mock.calls[0]
    expect(ops).toEqual([{ op: 'set_active_page', pageId: 'page-b' }])
    expect(enqueuePendingOp).toHaveBeenCalledWith({ op: 'set_active_page', pageId: 'page-b' })
    expect(setSelectedIds).toHaveBeenCalledWith(['root-b'])
  })
})
