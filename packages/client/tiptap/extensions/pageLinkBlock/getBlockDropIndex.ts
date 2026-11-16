import type {Slice} from '@tiptap/pm/model'
import {dropPoint} from '@tiptap/pm/transform'
import type {EditorView} from '@tiptap/pm/view'

export const getBlockDropIndex = (view: EditorView, event: DragEvent, slice: Slice) => {
  const coords = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (!coords) return undefined
  const {doc} = view.state
  const $point = doc.resolve(dropPoint(doc, coords.pos, slice) ?? coords.pos)
  if ($point.depth === 0) return $point.index(0)
  const isLowerHalf = $point.pos > ($point.before(1) + $point.after(1)) / 2
  return $point.index(0) + (isLowerHalf ? 1 : 0)
}
