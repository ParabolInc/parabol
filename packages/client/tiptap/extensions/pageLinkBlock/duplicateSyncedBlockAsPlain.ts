import type {Editor} from '@tiptap/core'
import {Fragment} from '@tiptap/pm/model'
import {getSyncedBlockBody} from '../../../shared/tiptap/getSyncedBlockBody'
import {createBlockSelection} from '../../blockSelection/blockSelectionState'
import {getSyncedLinkAt} from './getSyncedLinkAt'
import {getNestedEditor} from './syncedBlockFocus'

export const duplicateSyncedBlockAsPlain = (hostEditor: Editor, pos: number, pageCode: number) => {
  const {state, view} = hostEditor
  const block = getSyncedLinkAt(state.doc, pos, pageCode)
  const nested = getNestedEditor(view, pos)
  if (!block || !nested) return false
  const copy = Fragment.fromJSON(state.schema, getSyncedBlockBody(nested.getJSON()))
  const insertAt = pos + block.nodeSize
  const tr = state.tr.insert(insertAt, copy)
  const range = {from: insertAt, to: insertAt + copy.size, depth: state.doc.resolve(pos).depth}
  view.dispatch(tr.setSelection(createBlockSelection(tr.doc, range)).scrollIntoView())
  return true
}
