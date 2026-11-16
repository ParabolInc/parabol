import type {Editor} from '@tiptap/core'
import {readName} from '../extensions/pageLinkBlock/useSyncedBlockName'
import type {BlockDragSession} from './blockDragSession'
import {moveBlocksToPage} from './moveBlocksToPage'
import {showBlockMoveSnack} from './showBlockMoveSnack'

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
  const outcome = await moveBlocksToPage({session, targetPageId, targetTitle, insertIndex})
  showBlockMoveSnack({
    atmosphere: blockEditor.storage.blockMoveHistory.atmosphere,
    editor: session.editor,
    outcome,
    count: session.count,
    targetPageId,
    targetTitle
  })
}
