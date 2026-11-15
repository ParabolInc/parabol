import type Atmosphere from '../../Atmosphere'

export const BLOCK_MOVE_SNACK_KEY = 'blockMove'
export const BLOCK_MOVE_UNDO_SNACK_KEY = 'blockMoveUndo'

export const showBlockMoveNotice = (atmosphere: Atmosphere, key: string, message: string) => {
  atmosphere.eventEmitter.emit('removeSnackbar', (snack) => snack.key === key)
  atmosphere.eventEmitter.emit('addSnackbar', {key, message, autoDismiss: 10})
}
