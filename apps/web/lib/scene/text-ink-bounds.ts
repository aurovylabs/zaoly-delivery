/**
 * Text leaf types whose canvas chrome should hug glyph ink
 * (not the full CSS em/line box). Spec: editor-workspace.md § Text leaf hug.
 */
export const TEXT_LEAF_NODE_TYPES = new Set([
  'Text',
  'Heading',
  'SiteText',
  'Link',
  'SiteLink',
])

export function isTextLeafNodeType(type: string | null | undefined): boolean {
  return Boolean(type && TEXT_LEAF_NODE_TYPES.has(type))
}

export type ClientRectLike = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export type Bounds = {
  left: number
  top: number
  width: number
  height: number
}

/** Union of client rects relative to a viewport origin. */
export function unionClientRectsToBounds(
  rects: Iterable<ClientRectLike>,
  viewport: Pick<ClientRectLike, 'left' | 'top'>,
): Bounds | null {
  let minL = Infinity
  let minT = Infinity
  let maxR = -Infinity
  let maxB = -Infinity
  let found = false
  for (const r of rects) {
    if (!(r.width > 0 || r.height > 0)) continue
    found = true
    minL = Math.min(minL, r.left)
    minT = Math.min(minT, r.top)
    maxR = Math.max(maxR, r.right)
    maxB = Math.max(maxB, r.bottom)
  }
  if (!found) return null
  return {
    left: minL - viewport.left,
    top: minT - viewport.top,
    width: Math.max(0, maxR - minL),
    height: Math.max(0, maxB - minT),
  }
}

/**
 * Prefer the tighter of layout box vs text Range rects.
 * Range still follows line boxes in most engines; after `text-box-trim`
 * both should hug. When Range is smaller (e.g. trailing empty line box), use it.
 */
export function preferTighterTextBounds(
  layout: Bounds,
  ink: Bounds | null,
): Bounds {
  if (!ink) return layout
  const layoutArea = layout.width * layout.height
  const inkArea = ink.width * ink.height
  if (inkArea <= 0) return layout
  // Prefer ink when it is meaningfully tighter (common half-leading waste).
  if (ink.height < layout.height * 0.92 || inkArea < layoutArea * 0.92) {
    return ink
  }
  return layout
}
