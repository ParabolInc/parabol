import type {Node, ResolvedPos} from '@tiptap/pm/model'
import type {Selection} from '@tiptap/pm/state'

export const isSyncedOriginal = (node: Node) =>
  node.type.name === 'pageLinkBlock' && !!node.attrs.synced && node.attrs.canonical === true

const findCut = ($pos: ResolvedPos, forward: boolean) => {
  for (let depth = $pos.depth - 1; depth >= 0; depth--) {
    const index = $pos.index(depth)
    const hasSibling = forward ? index < $pos.node(depth).childCount - 1 : index > 0
    if (hasSibling)
      return $pos.doc.resolve(forward ? $pos.after(depth + 1) : $pos.before(depth + 1))
    if ($pos.node(depth).type.spec.isolating) return null
  }
  return null
}

export const findSyncedOriginalBesideCaret = (selection: Selection, forward: boolean) => {
  if (!selection.empty) return null
  const {$from} = selection
  let $cut: ResolvedPos | null = $from
  if ($from.parent.isTextblock) {
    const atEdge = forward
      ? $from.parentOffset === $from.parent.content.size
      : $from.parentOffset === 0
    if (!atEdge) return null
    $cut = findCut($from, forward)
    if (!$cut || $cut.depth !== $from.depth - 1) return null
  }
  const node = forward ? $cut.nodeAfter : $cut.nodeBefore
  if (!node || !isSyncedOriginal(node)) return null
  return forward ? $cut.pos : $cut.pos - node.nodeSize
}
