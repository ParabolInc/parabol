import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import {appendBlocksToFragment} from './appendBlocksToFragment'
import {enqueue, type PendingRedo, undoneMoves} from './blockMoveHistoryState'
import {type BlockMoveMeta, popIsolated, type StackItem, setMoveMeta} from './blockMoveUndoStack'
import {getBlockMoveMessage} from './getBlockMoveMessage'
import type {BlockMoveResult} from './moveBlocksToPage'
import {removeMovedBlocks} from './removeMovedBlocks'
import {isRestoredEdited} from './restoredBlocks'
import {BLOCK_MOVE_SNACK_KEY, showBlockMoveNotice} from './showBlockMoveNotice'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'
import {writeToTargetPage} from './writeToTargetPage'

const redoMove = async (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta,
  pending: PendingRedo
) => {
  const isCancelled = () => pending.cancelled || editor.isDestroyed
  const report = (result: BlockMoveResult) => {
    const message = getBlockMoveMessage(result, meta.blocks.length, meta.targetTitle)
    if (message) {
      showBlockMoveNotice(editor.storage.blockMoveHistory.atmosphere, BLOCK_MOVE_SNACK_KEY, message)
    }
  }
  const outcome = await writeToTargetPage(meta.targetPageId, async (frag, provider) => {
    if (isCancelled()) return
    const moved = appendBlocksToFragment(frag, meta.blocks, editor.schema)
    const saved = await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)
    if (!saved || isCancelled()) {
      removeMovedBlocks(frag, moved)
      if (!saved && !isCancelled()) report('unsaved')
      return
    }
    if (isRestoredEdited(undoManager.doc, meta.restored ?? [])) {
      undoManager.redoStack = undoManager.redoStack.filter((redoItem) => redoItem !== item)
      report('copied')
      return
    }
    const {added} = popIsolated(undoManager, 'redo', [item])
    undoneMoves.delete(meta.blocks)
    if (added) setMoveMeta(added, {...meta, moved, restored: undefined})
  })
  if (typeof outcome === 'string' && !isCancelled()) report(outcome)
}

export const redoMoveStep = (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta
) => {
  const storage = editor.storage.blockMoveHistory
  const pending: PendingRedo = {cancelled: false}
  storage.pendingRedo = pending
  enqueue(editor, async () => {
    try {
      await redoMove(editor, undoManager, item, meta, pending)
    } finally {
      if (storage.pendingRedo === pending) storage.pendingRedo = null
    }
  })
}
