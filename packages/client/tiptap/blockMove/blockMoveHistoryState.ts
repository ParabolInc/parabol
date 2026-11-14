import type {Editor, JSONContent} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'

export type PendingRedo = {cancelled: boolean}

export type BlockMoveHistoryStorage = {
  atmosphere: Atmosphere
  queue: Promise<void>
  pendingRedo: PendingRedo | null
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
