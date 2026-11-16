import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import type Atmosphere from '../../Atmosphere'
import {enqueue, enqueueStep, undoneMoves} from './blockMoveHistoryState'
import {
  type BlockMoveMeta,
  getMoveMeta,
  getUndoManager,
  popIsolated,
  type StackItem,
  setMoveMeta
} from './blockMoveUndoStack'
import {
  getBlockMoveUndoMessage,
  getBlockMoveUnreachableUndoMessage,
  getBlockMoveUnrestorableMessage
} from './getBlockMoveMessage'
import {getGapPosition} from './getGapPosition'
import {removeMovedBlocks} from './removeMovedBlocks'
import {collectRestored} from './restoredBlocks'
import {BLOCK_MOVE_UNDO_SNACK_KEY, showBlockMoveNotice} from './showBlockMoveNotice'
import {undoChildPageMove} from './undoChildPageMove'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'
import {writeToTargetPage} from './writeToTargetPage'

const takeBackFromTarget = async (atmosphere: Atmosphere, meta: BlockMoveMeta) => {
  if (meta.moved.length === 0) return
  const outcome = await writeToTargetPage(
    meta.targetPageId,
    async (frag, provider) => {
      const {removed, kept} = removeMovedBlocks(frag, meta.moved)
      return {removed, kept, saved: await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)}
    },
    {refuseWhileStreaming: false}
  )
  const notify = (message: string) =>
    showBlockMoveNotice(atmosphere, BLOCK_MOVE_UNDO_SNACK_KEY, message)
  if (typeof outcome === 'string' || !outcome.saved) {
    notify(getBlockMoveUnreachableUndoMessage(meta.targetTitle))
    return
  }
  if (outcome.kept > 0) {
    notify(getBlockMoveUndoMessage(outcome.removed, outcome.kept, meta.targetTitle))
  }
}

const popMoveStep = (editor: Editor, undoManager: Y.UndoManager, item: StackItem) => {
  const meta = getMoveMeta(item)
  if (!meta) return false
  const docBefore = editor.state.doc
  const {popped, added} = popIsolated(undoManager, 'undo', [item])
  undoneMoves.add(meta.blocks)
  if (!popped || editor.state.doc.eq(docBefore)) return false
  if (added) setMoveMeta(added, {...meta, restored: collectRestored(undoManager.doc, added)})
  const {atmosphere} = editor.storage.blockMoveHistory
  enqueue(editor, () => takeBackFromTarget(atmosphere, meta))
  return true
}

const startChildPageUndo = (
  editor: Editor,
  undoManager: Y.UndoManager,
  moveItem: StackItem | undefined,
  meta: BlockMoveMeta
) => {
  undoneMoves.add(meta.blocks)
  const latestStepBefore = undoManager.undoStack.at(-1)
  return enqueueStep(editor, 'undo', (pending) =>
    undoChildPageMove(editor, {undoManager, moveItem, latestStepBefore, meta}, pending)
  )
}

export const undoMoveStep = (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta
) => {
  if (meta.childPages) {
    startChildPageUndo(editor, undoManager, item, meta)
    return
  }
  if (popMoveStep(editor, undoManager, item)) return
  showBlockMoveNotice(
    editor.storage.blockMoveHistory.atmosphere,
    BLOCK_MOVE_UNDO_SNACK_KEY,
    getBlockMoveUnrestorableMessage(meta.blocks.length, meta.targetTitle)
  )
}

export const undoBlockMove = async (editor: Editor, meta: BlockMoveMeta) => {
  const storage = editor.storage.blockMoveHistory
  if (editor.isDestroyed || storage.pendingStep || undoneMoves.has(meta.blocks)) return
  const undoManager = getUndoManager(editor.state)
  const moveItem = undoManager?.undoStack.find((item) => getMoveMeta(item)?.blocks === meta.blocks)
  const latestMeta = getMoveMeta(moveItem) ?? meta
  if (latestMeta.childPages) {
    if (undoManager) await startChildPageUndo(editor, undoManager, moveItem, latestMeta)
    return
  }
  if (undoManager && moveItem && popMoveStep(editor, undoManager, moveItem)) {
    await storage.queue
    return
  }
  const docBefore = editor.state.doc
  const insertAt = getGapPosition(docBefore, latestMeta.gap)
  editor.chain().setMeta('addToHistory', false).insertContentAt(insertAt, meta.blocks).run()
  if (editor.state.doc.eq(docBefore)) return
  undoneMoves.add(meta.blocks)
  await enqueue(editor, () => takeBackFromTarget(storage.atmosphere, latestMeta))
}
