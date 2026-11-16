import type {Editor} from '@tiptap/core'
import {readName} from '../extensions/pageLinkBlock/useSyncedBlockName'
import type {BlockDragSession} from './blockDragSession'
import {getBlockMoveMessage} from './getBlockMoveMessage'
import {moveBlocksToPage} from './moveBlocksToPage'
import {BLOCK_MOVE_SNACK_KEY, showBlockMoveNotice} from './showBlockMoveNotice'

export type SyncedBlockDrop = {
  blockEditor: Editor
  session: BlockDragSession
  targetPageId: string
  insertIndex: number | undefined
}

export const moveBlocksIntoSyncedBlock = async ({
  blockEditor,
  session,
  targetPageId,
  insertIndex
}: SyncedBlockDrop) => {
  const targetTitle = readName(blockEditor) || 'Synced block'
  const outcome = await moveBlocksToPage({
    session,
    targetPageId,
    targetTitle,
    insertIndex,
    nested: true
  })
  if (outcome.result === 'moved') return
  const message = getBlockMoveMessage(outcome.result, session.count, targetTitle)
  if (!message) return
  const {atmosphere} = blockEditor.storage.blockMoveHistory
  showBlockMoveNotice(atmosphere, BLOCK_MOVE_SNACK_KEY, message)
}
