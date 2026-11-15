import type {Editor} from '@tiptap/core'
import {
  type BlockMoveMeta,
  dispatchAsUndoStep,
  dropStackItem,
  getUndoManager,
  type StackItem,
  setMoveMeta
} from './blockMoveUndoStack'
import {holdsChildPageLink} from './blockSnapshot'
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
import type {TrackedRange} from './trackRange'
import {waitForChildPagesSettled} from './waitForChildPagesSettled'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'
import {writeToTargetPage} from './writeToTargetPage'

type ChildPage = NonNullable<BlockMoveMeta['childPages']>[number]

type UndoOutcome =
  | {kind: 'movedOff'; page: ChildPage}
  | {kind: 'unrestorable'}
  | {kind: 'done'; removed: number; kept: number; saved: boolean; stayed: ChildPage[]}

const restoreHere = (editor: Editor, meta: BlockMoveMeta, gap: TrackedRange | undefined) => {
  const undoManager = getUndoManager(editor.state)
  const docBefore = editor.state.doc
  const insert = () => {
    editor
      .chain()
      .insertContentAt(getGapPosition(docBefore, gap), meta.blocks, {updateSelection: false})
      .run()
  }
  if (!undoManager) {
    insert()
    return editor.state.doc.eq(docBefore) ? null : {redoItem: undefined}
  }
  const redoItem = dispatchAsUndoStep(undoManager, insert)
  if (editor.state.doc.eq(docBefore)) return null
  if (redoItem) {
    setMoveMeta(redoItem, {...meta, restored: collectRestored(undoManager.doc, redoItem)})
  }
  return {redoItem}
}

const forgetRedo = (editor: Editor, redoItem: StackItem | undefined) => {
  const undoManager = getUndoManager(editor.state)
  if (undoManager && redoItem) dropStackItem(undoManager, 'redo', redoItem)
}

const getMessage = (meta: BlockMoveMeta, outcome: UndoOutcome | string) => {
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
  meta: BlockMoveMeta,
  gap: TrackedRange | undefined
) => {
  const {atmosphere} = editor.storage.blockMoveHistory
  const childPages = meta.childPages ?? []
  const notify = (message: string) =>
    showBlockMoveNotice(atmosphere, BLOCK_MOVE_UNDO_SNACK_KEY, message)
  const unowned = findUnownedChildPage(atmosphere, childPages)
  if (unowned) {
    notify(getChildPageUnownedMessage('undo', unowned.title))
    return
  }
  const outcome = await writeToTargetPage(
    meta.targetPageId,
    async (frag, provider): Promise<UndoOutcome | void> => {
      const movedOff = childPages.find(
        ({pageCode}) => !holdsChildPageLink(frag, new Set([pageCode]))
      )
      if (movedOff) return {kind: 'movedOff', page: movedOff}
      if (editor.isDestroyed) return
      const restored = restoreHere(editor, meta, gap)
      if (!restored) return {kind: 'unrestorable'}
      const stayedCodes = await waitForChildPagesSettled(
        editor,
        frag,
        childPages.map(({pageCode}) => pageCode),
        BLOCK_MOVE_TIMEOUT_MS
      )
      const {removed, kept} = removeMovedBlocks(frag, meta.moved, stayedCodes)
      const saved = await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)
      const stayed = childPages.filter(({pageCode}) => stayedCodes.has(pageCode))
      if (stayed.length > 0) forgetRedo(editor, restored.redoItem)
      return {kind: 'done', removed, kept, saved, stayed}
    },
    {refuseWhileStreaming: false}
  )
  if (!outcome) return
  const message = getMessage(meta, outcome)
  if (message) notify(message)
}
