import type {Editor} from '@tiptap/react'

export const isTextSelected = (editor: Editor) => {
  const {
    state: {
      doc,
      selection: {empty, from, to}
    }
  } = editor

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.

  // when deleting a pageLinkBlock from the first line, from:4, to:6, but the selection is a Node, not text
  const isEmptyBlock = !doc.textBetween(from, to).length // && isTextSelection(selection)
  return !(empty || isEmptyBlock || !editor.isEditable)
}

export default isTextSelected
