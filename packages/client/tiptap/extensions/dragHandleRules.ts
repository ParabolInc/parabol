import type {DragHandleRule} from '@tiptap/extension-drag-handle'
import type {ResolvedPos} from '@tiptap/pm/model'

function isInside($pos: ResolvedPos, depth: number, typeName: string) {
  for (let d = depth - 1; d >= 0; d--) {
    if ($pos.node(d).type.name === typeName) return true
  }
  return false
}

// Which blocks the drag handle can pick, on top of the library's default rules
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
