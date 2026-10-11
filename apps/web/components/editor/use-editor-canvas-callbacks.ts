'use client'

import { useCallback, useRef } from 'react'
import type { CompositionScene, SceneNode, SceneOp } from '@zaoly/contracts'
import type { BrandTokenDragPayload } from '../../lib/inspect/token-drop'
import { planTokenDrop } from '../../lib/inspect/token-drop'
import { findMaster, findNodeInTree } from '../../lib/scene/expand-instances'
import {
  masterEditAllowsPaletteInsert,
  resolveMasterBoardDropTargetId,
} from '../../lib/scene/master-variants'
import {
  planCrossPageLayerDrop,
  planPaletteDrop,
  type LayerDropPosition,
  type PaletteDropEdge,
} from '../../lib/scene/ops'

export type EditorCanvasCallbacksInput = {
  sceneRef: React.RefObject<CompositionScene>
  editingMasterIdRef: React.RefObject<string | null>
  editingVariantIdRef: React.RefObject<string | null>
  layerDragIdRef: React.RefObject<string | null>
  workingRoot: (scene: CompositionScene) => SceneNode
  isNodeOrAncestorLocked: (root: SceneNode, id: string) => boolean
  findPageIdForNode: (scene: CompositionScene, nodeId: string) => string | undefined
  runOp: (op: SceneOp) => void
  onPaletteDrop: (type: string, targetId: string, edge: PaletteDropEdge) => void
  onTokenDrop: (payload: BrandTokenDragPayload, targetId: string) => void
  onCrossPageLayerDrop: (
    draggedId: string,
    toPageId: string,
    targetId?: string,
    position?: LayerDropPosition,
  ) => void
}

/** Stable SceneNodeView callbacks — P92 / `editor-performance.md`. */
export function useEditorCanvasCallbacks(input: EditorCanvasCallbacksInput) {
  const inputRef = useRef(input)
  inputRef.current = input

  const evaluateTokenDrop = useCallback((payload: BrandTokenDragPayload, targetId: string) => {
    const {
      sceneRef,
      workingRoot,
      isNodeOrAncestorLocked,
    } = inputRef.current
    const root = workingRoot(sceneRef.current!)
    if (isNodeOrAncestorLocked(root, targetId)) return false
    const node = findNodeInTree(root, targetId)
    if (!node) return false
    return planTokenDrop(payload.type, node.type).ok
  }, [])

  const onLayerPanelDrop = useCallback(
    (draggedId: string, targetId: string, position: LayerDropPosition) => {
      const { sceneRef, findPageIdForNode, onCrossPageLayerDrop } = inputRef.current
      const toPageId = findPageIdForNode(sceneRef.current!, targetId)
      if (!toPageId) return
      onCrossPageLayerDrop(draggedId, toPageId, targetId, position)
    },
    [],
  )

  const onLayerPanelDropToPage = useCallback((draggedId: string, pageId: string) => {
    inputRef.current.onCrossPageLayerDrop(draggedId, pageId)
  }, [])

  const evaluatePaletteDrop = useCallback((targetId: string, edge: PaletteDropEdge) => {
    const { sceneRef, workingRoot, editingMasterIdRef, editingVariantIdRef } = inputRef.current
    const scene = sceneRef.current!
    const root = workingRoot(scene)
    const editingMasterId = editingMasterIdRef.current
    if (editingMasterId) {
      const master = findMaster(scene.masters, editingMasterId)
      if (master && !masterEditAllowsPaletteInsert(master)) return false
      const variantId = editingVariantIdRef.current
      if (!variantId) return false
      const mapped = resolveMasterBoardDropTargetId(targetId, root, variantId)
      if (!mapped) return false
      return planPaletteDrop(scene, mapped, edge, root).ok
    }
    return planPaletteDrop(scene, targetId, edge, root).ok
  }, [])

  const evaluateLayerDrop = useCallback((targetId: string, edge: PaletteDropEdge) => {
    const { sceneRef, layerDragIdRef, findPageIdForNode, workingRoot } = inputRef.current
    const draggedId = layerDragIdRef.current
    if (!draggedId) return false
    const toPageId = findPageIdForNode(sceneRef.current!, targetId)
    if (!toPageId) return false
    const position: LayerDropPosition =
      edge === 'before' ? 'before' : edge === 'after' ? 'after' : 'into'
    return planCrossPageLayerDrop(
      sceneRef.current!,
      draggedId,
      toPageId,
      targetId,
      position,
    ).ok
  }, [])

  const evaluateLayerDropToPage = useCallback((pageId: string) => {
    const { sceneRef, layerDragIdRef } = inputRef.current
    const draggedId = layerDragIdRef.current
    if (!draggedId) return false
    return planCrossPageLayerDrop(sceneRef.current!, draggedId, pageId).ok
  }, [])

  const onLayerDragStart = useCallback((id: string) => {
    inputRef.current.layerDragIdRef.current = id
  }, [])

  const onLayerDragEnd = useCallback(() => {
    inputRef.current.layerDragIdRef.current = null
  }, [])

  const onSetProp = useCallback((nodeId: string, key: string, value: unknown) => {
    const { sceneRef, editingMasterIdRef, runOp } = inputRef.current
    if (!editingMasterIdRef.current && !findNodeInTree(sceneRef.current!.root, nodeId)) {
      return
    }
    runOp({ op: 'set_prop', nodeId, key, value })
  }, [])

  return {
    evaluateTokenDrop,
    onLayerPanelDrop,
    onLayerPanelDropToPage,
    evaluatePaletteDrop,
    evaluateLayerDrop,
    evaluateLayerDropToPage,
    onLayerDragStart,
    onLayerDragEnd,
    onSetProp,
  }
}
