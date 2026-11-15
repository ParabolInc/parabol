import type {Node, Slice} from '@tiptap/pm/model'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import {dropPoint} from '@tiptap/pm/transform'

const LIST_ITEM_TYPES = new Set(['listItem', 'taskItem'])

const isListItemSlice = (slice: Slice) => {
  if (slice.openStart !== 0 || slice.content.childCount === 0) return false
  let isItems = true
  slice.content.forEach((node) => {
    if (!LIST_ITEM_TYPES.has(node.type.name)) isItems = false
  })
  return isItems
}

export const getListItemDropPos = (doc: Node, pos: number, slice: Slice) => {
  if (!isListItemSlice(slice)) return null
  const $pos = doc.resolve(pos)
  if (!$pos.parent.isTextblock || $pos.depth < 3) return null
  if (!LIST_ITEM_TYPES.has($pos.node(-1).type.name) || $pos.index(-1) !== 0) return null
  const listDepth = $pos.depth - 2
  const stockPos = dropPoint(doc, pos, slice)
  if (stockPos !== null && stockPos > $pos.before(listDepth) && stockPos < $pos.after(listDepth)) {
    return null
  }
  return $pos.after()
}

export const listItemDropPointPlugin = () =>
  new Plugin({
    key: new PluginKey('listItemDropPoint'),
    view: (view) => {
      const {posAtCoords} = view
      // The drop handler and the drop cursor both find their spot through posAtCoords, so moving the
      // spot here keeps the line and the drop in agreement without re-implementing either
      view.posAtCoords = (coords) => {
        const result = posAtCoords.call(view, coords)
        const slice = view.dragging?.slice
        if (!result || !slice) return result
        const pos = getListItemDropPos(view.state.doc, result.pos, slice)
        const {from, to} = view.state.selection
        if (pos === null || (pos > from && pos < to)) return result
        return {...result, pos}
      }
      return {
        destroy: () => {
          view.posAtCoords = posAtCoords
        }
      }
    }
  })
