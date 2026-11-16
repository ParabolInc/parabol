import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import {appendBlocksToFragment} from './appendBlocksToFragment'
import {enqueueStep, type PendingStep, undoneMoves} from './blockMoveHistoryState'
import {
  type BlockMoveMeta,
  dropStackItem,
  popIsolated,
  pushMoveStep,
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
  pending: PendingStep
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
    return false
  }
  let redone = false
  const outcome = await writeToTargetPage(meta.targetPageId, async (frag, provider) => {
    if (isCancelled()) return
    const moved = appendBlocksToFragment(frag, meta.blocks, editor.schema, meta.insertIndex)
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
    const movedMeta = {...meta, moved, restored: undefined}
    if (added) setMoveMeta(added, movedMeta)
    else if (meta.childPages) pushMoveStep(undoManager, movedMeta)
    else return
    redone = true
  })
  if (typeof outcome === 'string' && !isCancelled()) report(outcome)
  return redone
}

export const redoMoveStep = (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta
) => {
  enqueueStep(editor, 'redo', (pending) => redoMove(editor, undoManager, item, meta, pending))
}
