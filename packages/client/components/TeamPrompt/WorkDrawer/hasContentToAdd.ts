import type {Editor} from '@tiptap/core'

const hasContentToAdd = (editor: Editor) => {
  const {doc} = editor.state
  let end = doc.childCount
  while (end > 0) {
    const last = doc.child(end - 1)
    if (last.type.name !== 'paragraph' || last.content.size > 0) break
    end--
  }
  return end > 0
}

export default hasContentToAdd
