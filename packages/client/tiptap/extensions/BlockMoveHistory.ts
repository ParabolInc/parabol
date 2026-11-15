import {type Command, Extension} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'
import type {BlockMoveHistoryStorage} from '../blockMove/blockMoveHistoryState'
import {getMoveMeta, getUndoManager, popOrdinary} from '../blockMove/blockMoveUndoStack'
import {redoMoveStep} from '../blockMove/redoBlockMove'
import {undoMoveStep} from '../blockMove/undoBlockMove'

export const BlockMoveHistory = Extension.create<{atmosphere: Atmosphere}, BlockMoveHistoryStorage>(
  {
    name: 'blockMoveHistory',

    addStorage() {
      return {atmosphere: this.options.atmosphere, queue: Promise.resolve(), pendingRedo: null}
    },

    // Runs below Collaboration's priority so these replace its undo/redo, which its Mod-z/Mod-y/Shift-Mod-z call
    addCommands() {
      const {editor, storage} = this
      const step =
        (direction: 'undo' | 'redo'): Command =>
        ({tr, state, dispatch}) => {
          tr.setMeta('preventDispatch', true)
          const undoManager = getUndoManager(state)
          if (!undoManager) return false
          const {pendingRedo} = storage
          if (pendingRedo && direction === 'undo' && !pendingRedo.cancelled) {
            if (dispatch) pendingRedo.cancelled = true
            return true
          }
          if (pendingRedo && direction === 'redo') {
            if (dispatch) pendingRedo.cancelled = false
            return true
          }
          const stack = direction === 'undo' ? undoManager.undoStack : undoManager.redoStack
          const top = stack.at(-1)
          if (!top) return false
          if (!dispatch) return true
          const meta = getMoveMeta(top)
          if (!meta) popOrdinary(undoManager, direction)
          else if (direction === 'undo') undoMoveStep(editor, undoManager, top, meta)
          else redoMoveStep(editor, undoManager, top, meta)
          return true
        }
      return {undo: () => step('undo'), redo: () => step('redo')}
    }
  }
)
