import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import {appendBlocksToFragment} from './appendBlocksToFragment'
import {enqueue, type PendingRedo, undoneMoves} from './blockMoveHistoryState'
import {
  type BlockMoveMeta,
  dropStackItem,
  popIsolated,
  type StackItem,
  setMoveMeta
} from './blockMoveUndoStack'
import {findUnownedChildPage} from './findUnownedChildPage'
import {getBlockMoveMessage, getChildPageUnownedMessage} from './getBlockMoveMessage'
import type {BlockMoveResult} from './moveBlocksToPage'
import {removeMovedBlocks} from './removeMovedBlocks'
import {isRestoredEdited} from './restoredBlocks'
import {BLOCK_MOVE_SNACK_KEY, showBlockMoveNotice} from './showBlockMoveNotice'
import {waitForChildLinksRemoved} from './waitForChildLinksRemoved'
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
  const {atmosphere} = editor.storage.blockMoveHistory
  const notify = (message: string) => showBlockMoveNotice(atmosphere, BLOCK_MOVE_SNACK_KEY, message)
  const report = (result: BlockMoveResult) => {
    const message = getBlockMoveMessage(result, meta.blocks.length, meta.targetTitle)
    if (message) notify(message)
  }
  const childPageCodes = (meta.childPages ?? []).map(({pageCode}) => pageCode)
  const unowned = findUnownedChildPage(atmosphere, meta.childPages ?? [])
  if (unowned) {
    notify(getChildPageUnownedMessage('move', unowned.title))
    return
  }
  const outcome = await writeToTargetPage(meta.targetPageId, async (frag, provider) => {
    if (isCancelled()) return
    const moved = appendBlocksToFragment(frag, meta.blocks, editor.schema)
    const saved = await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)
    const carriesPages = childPageCodes.length > 0
    if (!carriesPages && (!saved || isCancelled())) {
      removeMovedBlocks(frag, moved)
      if (!saved && !isCancelled()) report('unsaved')
      return
    }
    const linksRemoved =
      saved &&
      (!carriesPages ||
        (await waitForChildLinksRemoved(editor, childPageCodes, BLOCK_MOVE_TIMEOUT_MS)))
    if (editor.isDestroyed) return
    if (!linksRemoved || isRestoredEdited(undoManager.doc, meta.restored ?? [])) {
      dropStackItem(undoManager, 'redo', item)
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
