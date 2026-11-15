import {Plugin} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'

let dragOrigin: Element | null = null
let isTrackingDrags = false

const trackDragOrigin = () => {
  if (isTrackingDrags) return
  isTrackingDrags = true
  window.addEventListener(
    'dragstart',
    (event) => {
      const {target} = event
      dragOrigin =
        target instanceof Element ? target : target instanceof Node ? target.parentElement : null
    },
    true
  )
  window.addEventListener(
    'dragend',
    () => {
      dragOrigin = null
    },
    true
  )
  window.addEventListener(
    'drop',
    () => {
      setTimeout(() => {
        dragOrigin = null
      })
    },
    true
  )
}

const isForeignDrag = (view: EditorView) => {
  if (!dragOrigin) return false
  const container = view.dom.parentElement
  const isInsideThisEditor =
    !!container?.contains(dragOrigin) &&
    dragOrigin.closest('[data-synced-editor]') === view.dom.closest('[data-synced-editor]')
  return !isInsideThisEditor
}

export const refuseForeignDrops = () =>
  new Plugin({
    view(view) {
      trackDragOrigin()
      const refuse = (event: Event) => {
        if (!isForeignDrag(view)) return
        event.stopPropagation()
        if (event.type === 'drop') event.preventDefault()
      }
      const types = ['dragenter', 'dragover', 'drop'] as const
      types.forEach((type) => view.dom.addEventListener(type, refuse, true))
      return {
        destroy() {
          types.forEach((type) => view.dom.removeEventListener(type, refuse, true))
        }
      }
    }
  })
