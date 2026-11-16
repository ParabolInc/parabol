import type {Editor} from '@tiptap/core'
import type {Transaction} from '@tiptap/pm/state'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import type Atmosphere from '../../../Atmosphere'
import {getUndoManager} from '../../blockMove/blockMoveUndoStack'

const SYNCED_BLOCK_UNSYNCED_SNACK_KEY = 'SyncedBlockUnsynced'

export const showSyncedBlockUnsyncSnack = (atmosphere: Atmosphere, editor: Editor) => {
  const undoManager = getUndoManager(editor.state)
  const unsyncStep = undoManager?.undoStack.at(-1)
  const release = () => {
    editor.off('transaction', removeSnackOnLocalEdit)
    editor.off('destroy', removeSnack)
  }
  const removeSnack = () => {
    atmosphere.eventEmitter.emit('removeSnackbar', ({onDismiss}) => onDismiss === release)
    release()
  }
  const removeSnackOnLocalEdit = ({transaction}: {transaction: Transaction}) => {
    if (transaction.docChanged && !transaction.getMeta(ySyncPluginKey)) removeSnack()
  }
  editor.on('transaction', removeSnackOnLocalEdit)
  editor.on('destroy', removeSnack)
  const undo = () => {
    if (editor.isDestroyed || !unsyncStep || undoManager?.undoStack.at(-1) !== unsyncStep) return
    editor.commands.undo()
  }
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: SYNCED_BLOCK_UNSYNCED_SNACK_KEY,
    message: 'This copy now has its own text.',
    autoDismiss: 10,
    onDismiss: release,
    action: {label: 'Undo', callback: undo}
  })
}
