import type {Editor} from '@tiptap/core'
import {Selection} from '@tiptap/pm/state'
import {type BlockMoveMeta, dispatchBlockMoveDelete} from '../extensions/BlockMoveHistory'
import {providerManager} from '../providerManager'
import {appendBlocksToFragment, type MovedBlock} from './appendBlocksToFragment'
import type {BlockDragSession} from './blockDragSession'
import {fingerprintBlocks} from './fingerprintBlocks'
import {getMovableBlocks} from './getMovableBlocks'
import {removeMovedBlocks} from './removeMovedBlocks'
import {type TrackedRange, trackRange} from './trackRange'
import {waitForChildLinksRemoved} from './waitForChildLinksRemoved'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from './waitForSaved'

export type BlockMoveResult =
  | 'moved'
  | 'copied'
  | 'offline'
  | 'readonly'
  | 'streaming'
  | 'unsaved'
  | 'gone'

export type BlockMoveOutcome = {
  result: BlockMoveResult
  meta: BlockMoveMeta | null
  gap: TrackedRange | null
  moved: MovedBlock[] | null
}

type Params = {session: BlockDragSession; targetPageId: string; targetTitle: string}

const resultOnly = (result: BlockMoveResult): BlockMoveOutcome => ({
  result,
  meta: null,
  gap: null,
  moved: null
})

const deleteFromSource = (editor: Editor, from: number, to: number, meta: BlockMoveMeta | null) => {
  const tr = editor.state.tr.deleteRange(from, to)
  const gapPos = tr.mapping.map(from)
  tr.setSelection(Selection.near(tr.doc.resolve(gapPos)))
  dispatchBlockMoveDelete(editor, tr, meta)
  return trackRange(editor, gapPos, gapPos)
}

const moveTrackedBlocks = async ({
  session,
  targetPageId,
  targetTitle
}: Params): Promise<BlockMoveOutcome> => {
  const {editor, range, movable} = session
  if (!range.current()) return resultOnly('gone')
  const childPageCodes = movable.childPages.map(({pageCode}) => pageCode)
  const ignoredPageCodes = new Set(childPageCodes)
  const snapshot = fingerprintBlocks(movable.blocks, ignoredPageCodes)
  const provider = await providerManager.openSynced(targetPageId, BLOCK_MOVE_TIMEOUT_MS)
  if (!provider) return resultOnly('offline')
  try {
    if (provider.authorizedScope === 'readonly') return resultOnly('readonly')
    const frag = provider.document.getXmlFragment('default')
    if (frag.querySelector('thinkingBlock')) return resultOnly('streaming')
    if (!range.current()) return resultOnly('gone')
    const moved = appendBlocksToFragment(frag, movable.blocks, editor.schema)
    const copied: BlockMoveOutcome = {result: 'copied', meta: null, gap: null, moved}
    if (!(await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS))) {
      if (childPageCodes.length > 0) return copied
      removeMovedBlocks(frag, moved)
      return resultOnly('unsaved')
    }
    const linksRemoved =
      childPageCodes.length === 0 ||
      (await waitForChildLinksRemoved(editor, childPageCodes, BLOCK_MOVE_TIMEOUT_MS))
    const current = range.current()
    if (!linksRemoved || !current || editor.isDestroyed) return copied
    const now = getMovableBlocks(editor.state.doc, current.from, current.to).blocks
    if (fingerprintBlocks(now, ignoredPageCodes) !== snapshot) return copied
    const meta =
      childPageCodes.length === 0
        ? {targetPageId, targetTitle, moved, blocks: movable.blocks}
        : null
    const gap = deleteFromSource(editor, current.from, current.to, meta)
    return {result: 'moved', meta, gap, moved}
  } finally {
    providerManager.unregister(targetPageId)
  }
}

export const moveBlocksToPage = async (params: Params) => {
  try {
    return await moveTrackedBlocks(params)
  } finally {
    params.session.range.stop()
  }
}
