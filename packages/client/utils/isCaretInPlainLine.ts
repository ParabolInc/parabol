import type {Editor} from '@tiptap/core'

const isCaretInPlainLine = (editor: Editor) => {
  const {$from} = editor.state.selection
  return $from.depth === 1 && $from.parent.type.name === 'paragraph'
}

export default isCaretInPlainLine
