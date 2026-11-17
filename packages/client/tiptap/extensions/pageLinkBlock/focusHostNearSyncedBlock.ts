import type {Editor} from '@tiptap/core'
import {Selection} from '@tiptap/pm/state'
import {keepFocusInHost} from './keepFocusInHost'

export const focusHostNearSyncedBlock = (
  hostEditor: Editor,
  pos: number | undefined,
  pageCode: number
) => {
  const {view} = hostEditor
  const inRange = pos !== undefined && pos >= 0 && pos <= view.state.doc.content.size
  const node = inRange ? view.state.doc.nodeAt(pos) : null
  const isBlock =
    pos !== undefined &&
    node?.type.name === 'pageLinkBlock' &&
    node.attrs.synced === true &&
    node.attrs.pageCode === pageCode
  if (!isBlock) {
    hostEditor.commands.focus()
    return
  }
  const {doc} = view.state
  const after = pos + node.nodeSize
  const selection =
    Selection.findFrom(doc.resolve(after), 1, true) ??
    Selection.findFrom(doc.resolve(pos), -1, true)
  keepFocusInHost(view.nodeDOM(pos))
  if (selection) view.dispatch(view.state.tr.setSelection(selection).scrollIntoView())
  view.focus()
}
