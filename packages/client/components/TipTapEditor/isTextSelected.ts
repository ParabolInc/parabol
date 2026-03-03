import type {NodeSelection} from '@tiptap/pm/state'
import type {Editor} from '@tiptap/react'

export const isTextSelected = (editor: Editor) => {
  const {state} = editor
  const {doc, selection} = state
  const {empty, from, to} = selection
  // If the entire node is selected, e.g. when it is dragged, do not treat it as a text selection
  if ((selection as NodeSelection).node) return false

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.

  // when deleting a pageLinkBlock from the first line, from:4, to:6, but the selection is a Node, not text
  const hasEditorFocus = editor.view.hasFocus()
  const isEmptyBlock = !doc.textBetween(from, to).length // && isTextSelection(selection)
  return !(empty || isEmptyBlock || !editor.isEditable || !hasEditorFocus)
}

export default isTextSelected
