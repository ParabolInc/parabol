import type {Editor} from '@tiptap/core'
import {Selection} from '@tiptap/pm/state'
import {keepFocusInHost} from './keepFocusInHost'

export const focusHostNearSyncedBlock = (
  hostEditor: Editor,
  pos: number | undefined,
  pageCode: number
) => {
  const {view} = hostEditor
  const node = pos === undefined ? null : view.state.doc.nodeAt(pos)
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
  hostEditor.commands.focus()
}
