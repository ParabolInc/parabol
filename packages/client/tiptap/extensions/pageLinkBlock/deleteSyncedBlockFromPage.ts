import type {Editor} from '@tiptap/core'
import {getSyncedLinkAt} from './getSyncedLinkAt'

export const deleteSyncedBlockFromPage = (hostEditor: Editor, pos: number, pageCode: number) => {
  const {state, view} = hostEditor
  const block = getSyncedLinkAt(state.doc, pos, pageCode)
  if (!block) return false
  view.dispatch(state.tr.delete(pos, pos + block.nodeSize))
  return true
}
