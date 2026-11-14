import type {Editor} from '@tiptap/core'

export const renameSyncedBlock = (editor: Editor, name: string) => {
  const {state} = editor
  const nextName = name.trim()
  const first = state.doc.firstChild
  const isHeading = first?.type.name === 'heading'
  if (nextName === (isHeading ? first.textContent : '')) return false
  const {tr, schema} = state
  if (isHeading) {
    if (nextName) tr.replaceWith(1, 1 + first.content.size, schema.text(nextName))
    else tr.delete(1, 1 + first.content.size)
  } else {
    tr.insert(0, schema.nodes.heading!.create({level: 1}, schema.text(nextName)))
  }
  editor.view.dispatch(tr)
  return true
}
