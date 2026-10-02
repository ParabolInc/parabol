import type {Node as PMNode} from '@tiptap/pm/model'
import type {EditorState, Transaction} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'

const LIST_NODE_NAMES = new Set(['taskList', 'bulletList', 'orderedList'])
const ITEM_NODE_NAMES = new Set(['listItem', 'taskItem'])

export const isListNode = (node: PMNode): boolean => LIST_NODE_NAMES.has(node.type.name)

const isItemNode = (node: PMNode): boolean => ITEM_NODE_NAMES.has(node.type.name)

/**
 * Move the whole list node at `sourceListPos` so it becomes the last block
 * child of the item (listItem/taskItem) at `targetItemPos`. The source node is
 * relocated intact, so its type (e.g. taskList) is preserved. Order of
 * delete/insert is chosen by relative position to avoid coordinate drift.
 */
export const moveListIntoItem = (
  state: EditorState,
  sourceListPos: number,
  targetItemPos: number
): Transaction => {
  const {doc, tr} = state
  const sourceNode = doc.nodeAt(sourceListPos)
  if (!sourceNode) throw new Error('nestListDrop: no source node at position')
  const targetItem = doc.nodeAt(targetItemPos)
  if (!targetItem) throw new Error('nestListDrop: no target item at position')

  const sourceFrom = sourceListPos
  const sourceTo = sourceListPos + sourceNode.nodeSize
  const insertPos = targetItemPos + 1 + targetItem.content.size

  if (insertPos <= sourceFrom) {
    tr.insert(insertPos, sourceNode)
    const shift = sourceNode.nodeSize
    tr.delete(sourceFrom + shift, sourceTo + shift)
  } else {
    tr.delete(sourceFrom, sourceTo)
    const shift = sourceNode.nodeSize
    tr.insert(insertPos - shift, sourceNode)
  }
  return tr
}

export interface NestDropTarget {
  targetItemPos: number
}

/**
 * Given a drop event, decide whether the gesture is a "nest" and, if so, which
 * item to nest into. Returns null to fall back to ProseMirror's default
 * (sibling) placement.
 *
 * The reference edge is the candidate item's *containing list* left edge — i.e.
 * the column where a top-level sibling sits. Nesting requires pushing the cursor
 * `indentPx` to the right of that column. Measuring against the item's own left
 * edge would over-trigger, since list text is already indented from the list by
 * the marker/padding width.
 *
 * NOTE: DOM-coordinate logic — verified in the browser, not unit tests.
 */
export const findNestDropTarget = (
  view: EditorView,
  event: DragEvent,
  indentPx: number
): NestDropTarget | null => {
  const coords = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (!coords) return null
  const $pos = view.state.doc.resolve(coords.pos)

  for (let depth = $pos.depth; depth >= 1; depth--) {
    const node = $pos.node(depth)
    if (isItemNode(node)) {
      const itemPos = $pos.before(depth)
      // The item's parent is its list (depth - 1); use the list's left edge as
      // the sibling-indent reference.
      const listPos = $pos.before(depth - 1)
      const listDom = view.nodeDOM(listPos)
      if (!(listDom instanceof HTMLElement)) return null
      const listLeft = listDom.getBoundingClientRect().left
      if (event.clientX - listLeft > indentPx) return {targetItemPos: itemPos}
      return null
    }
  }
  return null
}
