import type {EditorView} from '@tiptap/pm/view'

let dragOrigin: Element | null = null
let isTracking = false

const toElement = (target: EventTarget | null) =>
  target instanceof Element ? target : target instanceof Node ? target.parentElement : null

export const trackDragOrigin = () => {
  if (isTracking) return
  isTracking = true
  window.addEventListener(
    'dragstart',
    (event) => {
      dragOrigin = toElement(event.target)
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

const getSyncedEditor = (element: Element | null) => element?.closest('[data-synced-editor]')

export const isDragFromOutside = (view: EditorView) => {
  if (!dragOrigin) return false
  const startedInThisEditor =
    !!view.dom.parentElement?.contains(dragOrigin) &&
    getSyncedEditor(dragOrigin) === getSyncedEditor(view.dom)
  return !startedInThisEditor
}

export const isOverInnerSyncedEditor = (target: EventTarget | null, view: EditorView) => {
  const owner = getSyncedEditor(toElement(target))
  return !!owner && owner !== getSyncedEditor(view.dom)
}
