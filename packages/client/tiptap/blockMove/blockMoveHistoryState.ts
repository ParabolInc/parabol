import type {Editor, JSONContent} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'
import type {Direction} from './blockMoveUndoStack'

export type PendingStep = {direction: Direction; cancelled: boolean}

export type BlockMoveHistoryStorage = {
  atmosphere: Atmosphere
  queue: Promise<void>
  pendingStep: PendingStep | null
}

declare module '@tiptap/core' {
  interface Storage {
    blockMoveHistory: BlockMoveHistoryStorage
  }
}

// Keyed by the move's blocks array, which every copy of its meta shares, so the snackbar Undo and ⌘Z can't both undo one move
export const undoneMoves = new WeakSet<JSONContent[]>()

export const enqueue = (editor: Editor, task: () => Promise<void>) => {
  const storage = editor.storage.blockMoveHistory
  storage.queue = storage.queue.then(task).catch((error) => {
    console.error(error)
  })
  return storage.queue
}

// A step pressed the other way while this one is pending cancels it, or reverses it once it can no longer be stopped
export const enqueueStep = (
  editor: Editor,
  direction: Direction,
  step: (pending: PendingStep) => Promise<boolean>
) => {
  const storage = editor.storage.blockMoveHistory
  const pending: PendingStep = {direction, cancelled: false}
  storage.pendingStep = pending
  return enqueue(editor, async () => {
    let reversible = false
    try {
      reversible = await step(pending)
    } finally {
      if (storage.pendingStep === pending) storage.pendingStep = null
    }
    if (!reversible || !pending.cancelled || editor.isDestroyed) return
    if (direction === 'undo') editor.commands.redo()
    else editor.commands.undo()
  })
}
