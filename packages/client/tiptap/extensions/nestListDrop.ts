import type {Node as PMNode} from '@tiptap/pm/model'
import {type EditorState, Plugin, PluginKey} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import type {TrackedRange} from '../blockMove/trackRange'

const LIST_NODE_NAMES = new Set(['taskList', 'bulletList', 'orderedList'])
const ITEM_NODE_NAMES = new Set(['listItem', 'taskItem'])

// px the cursor must sit right of a list's left edge to nest into one of its items
const NEST_INDENT_PX = 24

export const isListNode = (node: PMNode) => LIST_NODE_NAMES.has(node.type.name)
const isItemNode = (node: PMNode) => ITEM_NODE_NAMES.has(node.type.name)

export const moveListIntoItem = (
  state: EditorState,
  sourceListPos: number,
  targetItemPos: number
) => {
  const {doc, tr} = state
  const sourceNode = doc.nodeAt(sourceListPos)
  const targetItem = doc.nodeAt(targetItemPos)
  if (!sourceNode || !targetItem) return null
  const insertPos = targetItemPos + 1 + targetItem.content.size
  tr.delete(sourceListPos, sourceListPos + sourceNode.nodeSize)
  tr.insert(tr.mapping.map(insertPos), sourceNode)
  return tr
}

// Measured from the item's list, not the item: list text already sits a marker's width in
export const findNestDropTarget = (view: EditorView, event: DragEvent) => {
  const coords = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (!coords) return null
  const $pos = view.state.doc.resolve(coords.pos)
  for (let depth = $pos.depth; depth >= 1; depth--) {
    if (!isItemNode($pos.node(depth))) continue
    const listDom = view.nodeDOM($pos.before(depth - 1))
    if (!(listDom instanceof HTMLElement)) return null
    const listLeft = listDom.getBoundingClientRect().left
    return event.clientX - listLeft > NEST_INDENT_PX ? $pos.before(depth) : null
  }
  return null
}

const isPageDropTarget = (event: DragEvent) =>
  event.target instanceof Element && !!event.target.closest('[data-drop-in], [data-drop-refused]')

const getNestDrop = (view: EditorView, event: DragEvent, draggedList: TrackedRange | null) => {
  const range = draggedList?.current()
  if (!range || isPageDropTarget(event)) return null
  const sourceNode = view.state.doc.nodeAt(range.from)
  if (!sourceNode || !isListNode(sourceNode) || range.from + sourceNode.nodeSize !== range.to) {
    return null
  }
  const targetItemPos = findNestDropTarget(view, event)
  if (targetItemPos === null) return null
  if (targetItemPos > range.from && targetItemPos < range.to) return null
  return {sourcePos: range.from, targetItemPos}
}

export const listNestDropPlugin = (getDraggedList: () => TrackedRange | null) => {
  let indicator: HTMLDivElement | null = null
  const hideIndicator = () => {
    if (indicator) indicator.style.display = 'none'
  }
  const showIndicator = (rect: DOMRect) => {
    if (!indicator) {
      indicator = document.createElement('div')
      indicator.className = 'pointer-events-none fixed z-50 h-0.5 rounded-full bg-accent'
      document.body.appendChild(indicator)
    }
    indicator.style.display = 'block'
    indicator.style.left = `${rect.left + NEST_INDENT_PX}px`
    indicator.style.top = `${rect.bottom}px`
    indicator.style.width = `${Math.max(rect.width - NEST_INDENT_PX, 0)}px`
  }
  return new Plugin({
    key: new PluginKey('listNestDrop'),
    view: () => {
      document.addEventListener('dragend', hideIndicator)
      return {
        destroy: () => {
          document.removeEventListener('dragend', hideIndicator)
          indicator?.remove()
          indicator = null
        }
      }
    },
    props: {
      handleDrop: (view, event, _slice, moved) => {
        hideIndicator()
        if (!moved) return false
        const nestDrop = getNestDrop(view, event, getDraggedList())
        const tr =
          nestDrop && moveListIntoItem(view.state, nestDrop.sourcePos, nestDrop.targetItemPos)
        if (!tr) return false
        view.dispatch(tr)
        event.preventDefault()
        return true
      },
      handleDOMEvents: {
        dragover: (view, event) => {
          const nestDrop = getNestDrop(view, event, getDraggedList())
          const dom = nestDrop && view.nodeDOM(nestDrop.targetItemPos)
          if (dom instanceof HTMLElement) showIndicator(dom.getBoundingClientRect())
          else hideIndicator()
          return false
        },
        dragleave: (view, event) => {
          const next = event.relatedTarget
          if (!(next instanceof Node) || !view.dom.contains(next)) hideIndicator()
          return false
        }
      }
    }
  })
}
