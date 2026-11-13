import {type DragHandleRule, defaultRules} from '@tiptap/extension-drag-handle'
import type {ResolvedPos} from '@tiptap/pm/model'
import type {EditorView} from '@tiptap/pm/view'
import {getTurnIntoTarget} from './turnInto/turnBlockInto'

function isInside($pos: ResolvedPos, depth: number, typeName: string) {
  for (let d = depth - 1; d >= 0; d--) {
    if ($pos.node(d).type.name === typeName) return true
  }
  return false
}

export const pageDragHandleRules: DragHandleRule[] = [
  {
    id: 'detailsStructure',
    evaluate: ({$pos, depth, node}) => {
      // Exclude detailsSummary and detailsContent themselves
      const name = node.type.name
      if (name === 'detailsSummary' || name === 'detailsContent') return 1000
      // Exclude children nested inside detailsSummary
      if (isInside($pos, depth, 'detailsSummary')) return 1000
      // Allow children of detailsContent (they should be independently draggable)
      return 0
    }
  },
  {
    // A quote is one block. Without this the target flips between a line and the
    // whole quote depending on how the pointer approaches the handle.
    id: 'quoteStructure',
    evaluate: ({$pos, depth}) => (isInside($pos, depth, 'blockquote') ? 1000 : 0)
  }
]

const DRAG_HANDLE_BASE_SCORE = 1000
const rules = [...defaultRules, ...pageDragHandleRules]

export const getSelectionTurnIntoPos = (view: EditorView): number | null => {
  const {doc, selection} = view.state
  const {$from, $to} = selection
  if (!$from.parent.isTextblock || !$from.sameParent($to)) return null
  for (let depth = $from.depth; depth > 0; depth--) {
    const parent = $from.node(depth - 1)
    const index = $from.index(depth - 1)
    const pos = $from.before(depth)
    const context = {
      node: $from.node(depth),
      pos,
      depth,
      parent,
      index,
      isFirst: index === 0,
      isLast: index === parent.childCount - 1,
      $pos: $from,
      view
    }
    const deduction = rules.reduce((sum, rule) => sum + rule.evaluate(context), 0)
    if (deduction >= DRAG_HANDLE_BASE_SCORE) continue
    return getTurnIntoTarget(doc, pos) ? pos : null
  }
  return null
}
