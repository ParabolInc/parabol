import type {Editor} from '@tiptap/core'
import type * as Y from 'yjs'
import type {PendingStep} from './blockMoveHistoryState'
import {
  type BlockMoveMeta,
  dispatchAsUndoStep,
  dropStackItem,
  type StackItem,
  setMoveMeta
} from './blockMoveUndoStack'
import {childPageCodesIn} from './blockSnapshot'
import {findUnownedChildPage} from './findUnownedChildPage'
import {
  getBlockMoveUndoMessage,
  getBlockMoveUnreachableUndoMessage,
  getBlockMoveUnrestorableMessage,
  getChildPageMovedOffMessage,
  getChildPageStayedMessage,
  getChildPageUndoUnreachableMessage,
  getChildPageUnownedMessage
} from './getBlockMoveMessage'
import {getGapPosition} from './getGapPosition'
import {removeMovedBlocks} from './removeMovedBlocks'
import {collectRestored} from './restoredBlocks'
import {BLOCK_MOVE_UNDO_SNACK_KEY, showBlockMoveNotice} from './showBlockMoveNotice'
import {waitForChildPagesSettled} from './waitForChildPagesSettled'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'
import {type TargetRefusal, writeToTargetPage} from './writeToTargetPage'

type ChildPage = NonNullable<BlockMoveMeta['childPages']>[number]

type UndoOutcome =
  | {kind: 'movedOff'; page: ChildPage}
  | {kind: 'unrestorable'}
  | {kind: 'done'; removed: number; kept: number; saved: boolean; stayed: ChildPage[]}

export type ChildPageUndoResult = 'unchanged' | 'restored' | 'reversible'

const restoreHere = (editor: Editor, undoManager: Y.UndoManager, meta: BlockMoveMeta) => {
  const docBefore = editor.state.doc
  const redoItem = dispatchAsUndoStep(undoManager, () => {
    editor
      .chain()
      .insertContentAt(getGapPosition(docBefore, meta.gap), meta.blocks, {updateSelection: false})
      .run()
  })
  if (!redoItem || editor.state.doc.eq(docBefore)) return null
  setMoveMeta(redoItem, {...meta, restored: collectRestored(undoManager.doc, redoItem)})
  return redoItem
}

const getMessage = (meta: BlockMoveMeta, outcome: UndoOutcome | TargetRefusal) => {
  const {targetTitle} = meta
  if (typeof outcome === 'string') return getChildPageUndoUnreachableMessage(targetTitle)
  switch (outcome.kind) {
    case 'movedOff':
      return getChildPageMovedOffMessage(outcome.page.title, targetTitle)
    case 'unrestorable':
      return getBlockMoveUnrestorableMessage(meta.blocks.length, targetTitle)
    case 'done':
      if (outcome.stayed.length > 0) {
        return getChildPageStayedMessage(outcome.stayed[0]!.title, targetTitle)
      }
      if (!outcome.saved) return getBlockMoveUnreachableUndoMessage(targetTitle)
      if (outcome.kept > 0)
        return getBlockMoveUndoMessage(outcome.removed, outcome.kept, targetTitle)
      return null
  }
}

export const undoChildPageMove = async (
  editor: Editor,
  undoManager: Y.UndoManager,
  moveItem: StackItem | undefined,
  meta: BlockMoveMeta,
  pending: PendingStep
): Promise<ChildPageUndoResult> => {
  const {atmosphere} = editor.storage.blockMoveHistory
  const childPages = meta.childPages ?? []
  const notify = (message: string) =>
    showBlockMoveNotice(atmosphere, BLOCK_MOVE_UNDO_SNACK_KEY, message)
  const unowned = findUnownedChildPage(atmosphere, childPages)
  if (unowned) {
    notify(getChildPageUnownedMessage('undo', unowned.title))
    return 'unchanged'
  }
  const latestStepBefore = undoManager.undoStack.at(-1)
  let result: ChildPageUndoResult = 'unchanged'
  const outcome = await writeToTargetPage(
    meta.targetPageId,
    async (frag, provider): Promise<UndoOutcome | void> => {
      const onTarget = childPageCodesIn(frag)
      const movedOff = childPages.find(({pageCode}) => !onTarget.includes(pageCode))
      if (movedOff) return {kind: 'movedOff', page: movedOff}
      if (editor.isDestroyed || pending.cancelled) return
      const editedSince = undoManager.undoStack.at(-1) !== latestStepBefore
      const redoItem = restoreHere(editor, undoManager, meta)
      if (!redoItem) return {kind: 'unrestorable'}
      if (moveItem) dropStackItem(undoManager, 'undo', moveItem)
      result = 'restored'
      const stayedCodes = await waitForChildPagesSettled(
        editor,
        frag,
        childPages.map(({pageCode}) => pageCode),
        BLOCK_MOVE_TIMEOUT_MS
      )
      const {removed, kept} = removeMovedBlocks(frag, meta.moved)
      const saved = await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)
      const stayed = childPages.filter(({pageCode}) => stayedCodes.has(pageCode))
      if (stayed.length > 0 || editedSince) dropStackItem(undoManager, 'redo', redoItem)
      else result = 'reversible'
      return {kind: 'done', removed, kept, saved, stayed}
    },
    {refuseWhileStreaming: false}
  )
  if (!outcome) return result
  const message = getMessage(meta, outcome)
  if (message) notify(message)
  return result
}
