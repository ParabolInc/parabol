import type {Editor} from '@tiptap/core'
import {Fragment} from '@tiptap/pm/model'
import {TextSelection} from '@tiptap/pm/state'
import {getSyncedBlockBody} from '../../../shared/tiptap/getSyncedBlockBody'
import {getUndoManager} from '../../blockMove/blockMoveUndoStack'
import {getSyncedLinkAt} from './getSyncedLinkAt'
import {getNestedEditor} from './syncedBlockFocus'

export const SYNCED_BLOCK_UNSYNC_META = 'syncedBlockUnsync'

export const unsyncSyncedCopy = (hostEditor: Editor, pos: number, pageCode: number) => {
  const {state, view} = hostEditor
  const block = getSyncedLinkAt(state.doc, pos, pageCode)
  if (!block || block.attrs.canonical) return false
  const nested = getNestedEditor(view, pos)
  if (!nested) return false
  const body = Fragment.fromJSON(state.schema, getSyncedBlockBody(nested.getJSON()))
  const tr = state.tr.replaceWith(pos, pos + block.nodeSize, body)
  const caret = TextSelection.findFrom(tr.doc.resolve(pos), 1, true)
  if (caret) tr.setSelection(caret)
  tr.setMeta(SYNCED_BLOCK_UNSYNC_META, true).scrollIntoView()
  const undoManager = getUndoManager(state)
  undoManager?.stopCapturing()
  view.dispatch(tr)
  undoManager?.stopCapturing()
  return true
}
