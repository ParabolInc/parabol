import type {Editor} from '@tiptap/core'
import {getTextCaretNear} from '../blockSelection/blockSelectionState'
import {appendBlocksToFragment, type MovedBlock} from './appendBlocksToFragment'
import type {BlockDragSession} from './blockDragSession'
import {type BlockMoveMeta, dispatchBlockMoveDelete} from './blockMoveUndoStack'
import {fingerprintBlocks} from './fingerprintBlocks'
import {getMovableBlocks} from './getMovableBlocks'
import {removeMovedBlocks} from './removeMovedBlocks'
import {type TrackedRange, trackRange} from './trackRange'
import {waitForChildLinksRemoved} from './waitForChildLinksRemoved'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'
import {type TargetRefusal, writeToTargetPage} from './writeToTargetPage'

export type BlockMoveResult = 'moved' | 'copied' | 'unsaved' | 'gone' | TargetRefusal

export type BlockMoveOutcome = {
  result: BlockMoveResult
  meta: BlockMoveMeta | null
  moved: MovedBlock[] | null
}

type Params = {
  session: BlockDragSession
  targetPageId: string
  targetTitle: string
  insertIndex?: number
}

const resultOnly = (result: BlockMoveResult): BlockMoveOutcome => ({
  result,
  meta: null,
  moved: null
})

const deleteFromSource = (editor: Editor, from: number, to: number, meta: BlockMoveMeta) => {
  const tr = editor.state.tr.deleteRange(from, to)
  const gapPos = tr.mapping.map(from)
  tr.setSelection(getTextCaretNear(tr.doc.resolve(gapPos)))
  dispatchBlockMoveDelete(editor, tr, meta)
  meta.gap = trackRange(editor, gapPos, gapPos)
}

const moveTrackedBlocks = async (
  {session, targetPageId, targetTitle, insertIndex}: Params,
  startPoint: TrackedRange
): Promise<BlockMoveOutcome> => {
  const {editor, range, movable} = session
  const childPageCodes = movable.childPages.map(({pageCode}) => pageCode)
  const ignoredPageCodes = new Set(childPageCodes)
  const snapshot = fingerprintBlocks(movable.blocks, ignoredPageCodes)
  const outcome = await writeToTargetPage(
    targetPageId,
    async (frag, provider): Promise<BlockMoveOutcome> => {
      if (!range.current()) return resultOnly('gone')
      const moved = appendBlocksToFragment(frag, movable.blocks, editor.schema, insertIndex)
      const copied: BlockMoveOutcome = {result: 'copied', meta: null, moved}
      if (!(await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS))) {
        if (childPageCodes.length > 0) return copied
        removeMovedBlocks(frag, moved)
        return resultOnly('unsaved')
      }
      const linksRemoved =
        childPageCodes.length === 0 ||
        (await waitForChildLinksRemoved(editor, childPageCodes, BLOCK_MOVE_TIMEOUT_MS))
      const current = range.current() ?? startPoint.current()
      if (!linksRemoved || !current || editor.isDestroyed) return copied
      const now = getMovableBlocks(editor.state.doc, current.from, current.to).blocks
      if (fingerprintBlocks(now, ignoredPageCodes) !== snapshot) return copied
      const meta: BlockMoveMeta = {
        targetPageId,
        targetTitle,
        moved,
        blocks: movable.blocks,
        insertIndex
      }
      if (childPageCodes.length > 0) meta.childPages = movable.childPages
      deleteFromSource(editor, current.from, current.to, meta)
      return {result: 'moved', meta, moved}
    }
  )
  return typeof outcome === 'string' ? resultOnly(outcome) : outcome
}

export const moveBlocksToPage = async (params: Params) => {
  const {editor, range} = params.session
  const start = range.current()
  const startPoint = start && trackRange(editor, start.from, start.from)
  try {
    return startPoint ? await moveTrackedBlocks(params, startPoint) : resultOnly('gone')
  } finally {
    range.stop()
    startPoint?.stop()
  }
}
