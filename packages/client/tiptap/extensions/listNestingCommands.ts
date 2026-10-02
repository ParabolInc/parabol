import type {NodeType} from '@tiptap/pm/model'
import type {EditorState, Transaction} from '@tiptap/pm/state'

const LIST_NODE_NAMES = new Set(['taskList', 'bulletList', 'orderedList'])
const ITEM_NODE_NAMES = new Set(['listItem', 'taskItem'])

// The item type a given list contains.
const itemTypeForList = (state: EditorState, listName: string): NodeType | null => {
  const name = listName === 'taskList' ? 'taskItem' : 'listItem'
  return state.schema.nodes[name] ?? null
}

const makeItem = (type: NodeType, content: Parameters<NodeType['create']>[1]) => {
  const attrs = type.name === 'taskItem' ? {checked: false} : null
  return type.create(attrs, content)
}

/**
 * Indent (Tab): if the previous sibling item has a trailing sublist, move the
 * current item into it, converting to that sublist's item type ("adopt the list
 * you land in"). Returns null when there is no previous sibling or it has no
 * trailing sublist — the caller should fall back to stock `sinkListItem`, which
 * creates a same-type sublist.
 */
export const indentItem = (state: EditorState, itemPos: number): Transaction | null => {
  const {doc} = state
  const $item = doc.resolve(itemPos)
  const item = $item.nodeAfter
  if (!item || !ITEM_NODE_NAMES.has(item.type.name)) return null
  const list = $item.parent
  const idx = $item.index()
  if (idx === 0) return null
  const prevItem = list.child(idx - 1)
  const prevItemPos = itemPos - prevItem.nodeSize
  const sublist = prevItem.lastChild
  if (!sublist || !LIST_NODE_NAMES.has(sublist.type.name)) return null
  const newItemType = itemTypeForList(state, sublist.type.name)
  if (!newItemType) return null
  const newItem = makeItem(newItemType, item.content)
  // insertion point = end of prevItem's content (its trailing sublist's tail)
  const sublistContentEnd = prevItemPos + prevItem.content.size
  const {tr} = state
  tr.delete(itemPos, itemPos + item.nodeSize)
  tr.insert(tr.mapping.map(sublistContentEnd), newItem)
  return tr
}

/**
 * Outdent (Shift-Tab): lift the item out of its list to become a sibling in the
 * ancestor list, converting to that list's item type ("adopt the list you land
 * in"). Returns null when the item's list is not nested inside another list's
 * item — the caller should fall back to stock `liftListItem`.
 */
export const outdentItem = (state: EditorState, itemPos: number): Transaction | null => {
  const {doc} = state
  const $item = doc.resolve(itemPos)
  const item = $item.nodeAfter
  if (!item || !ITEM_NODE_NAMES.has(item.type.name)) return null
  const listDepth = $item.depth
  if (listDepth < 2) return null
  const grandItem = $item.node(listDepth - 1)
  if (!ITEM_NODE_NAMES.has(grandItem.type.name)) return null
  const ancestorList = $item.node(listDepth - 2)
  if (!LIST_NODE_NAMES.has(ancestorList.type.name)) return null

  const newItemType = itemTypeForList(state, ancestorList.type.name)
  if (!newItemType) return null
  const newItem = makeItem(newItemType, item.content)

  const list = $item.parent
  const afterGrandItem = $item.after(listDepth - 1)
  const {tr} = state
  if (list.childCount === 1) {
    // removing the item empties its list — drop the whole list
    tr.delete($item.before(listDepth), $item.after(listDepth))
  } else {
    tr.delete(itemPos, itemPos + item.nodeSize)
  }
  tr.insert(tr.mapping.map(afterGrandItem), newItem)
  return tr
}
