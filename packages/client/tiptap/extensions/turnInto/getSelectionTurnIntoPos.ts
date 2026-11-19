import type {EditorView} from '@tiptap/pm/view'
import {getSelectionBlockPos} from '../dragHandleRules'
import {getTurnIntoTarget} from './turnBlockInto'

export const getSelectionTurnIntoPos = (view: EditorView) => {
  const pos = getSelectionBlockPos(view)
  return pos !== null && getTurnIntoTarget(view.state.doc, pos) ? pos : null
}
