import type {Editor} from '@tiptap/core'
import type {BlockDragSession} from './blockDragSession'
import {moveBlocksToPage} from './moveBlocksToPage'
import {showBlockMoveSnack} from './showBlockMoveSnack'

export type BlockDrop = {
  targetEditor: Editor
  session: BlockDragSession
  targetPageId: string
  targetTitle: string
  insertIndex: number | undefined
}

export const moveDroppedBlocks = async ({
  targetEditor,
  session,
  targetPageId,
  targetTitle,
  insertIndex
}: BlockDrop) => {
  const outcome = await moveBlocksToPage({session, targetPageId, targetTitle, insertIndex})
  showBlockMoveSnack({
    atmosphere: targetEditor.storage.blockMoveHistory.atmosphere,
    editor: session.editor,
    outcome,
    count: session.count,
    targetPageId,
    targetTitle
  })
}
