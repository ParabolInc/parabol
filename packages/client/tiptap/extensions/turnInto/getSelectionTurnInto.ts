import type {EditorView} from '@tiptap/pm/view'
import {getSelectionBlockPos} from '../dragHandleRules'
import {getTurnIntoTarget} from './turnBlockInto'

export const getSelectionTurnInto = (view: EditorView) => {
  const pos = getSelectionBlockPos(view)
  const current = pos === null ? null : getTurnIntoTarget(view.state.doc, pos)
  return pos === null || !current ? null : {pos, current}
}
