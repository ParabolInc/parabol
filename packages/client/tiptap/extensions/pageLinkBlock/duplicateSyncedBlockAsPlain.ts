import type {Editor} from '@tiptap/core'
import {Fragment} from '@tiptap/pm/model'
import {copyAsPlainLinks, createBlockSelection} from '../../blockSelection/blockSelectionState'
import {getSyncedLinkAt} from './getSyncedLinkAt'
import {getNestedEditor} from './syncedBlockFocus'

export const duplicateSyncedBlockAsPlain = (hostEditor: Editor, pos: number, pageCode: number) => {
  const {state, view} = hostEditor
  const block = getSyncedLinkAt(state.doc, pos, pageCode)
  const nested = getNestedEditor(view, pos)
  if (!block || !nested) return false
  const nestedDoc = nested.state.doc
  const body = nestedDoc.content.cut(nestedDoc.firstChild?.nodeSize ?? 0)
  const copy =
    body.childCount === 0
      ? Fragment.from(state.schema.nodes.paragraph!.create())
      : copyAsPlainLinks(Fragment.fromJSON(state.schema, body.toJSON()))
  const insertAt = pos + block.nodeSize
  const tr = state.tr.insert(insertAt, copy)
  const range = {from: insertAt, to: insertAt + copy.size, depth: state.doc.resolve(pos).depth}
  view.dispatch(tr.setSelection(createBlockSelection(tr.doc, range)).scrollIntoView())
  return true
}
