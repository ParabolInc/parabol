import type {Editor, JSONContent} from '@tiptap/core'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import {GQLID} from '../../utils/GQLID'
import type {BlockDragState} from './getBlockDropRefusal'
import type {MovableBlocks} from './getMovableBlocks'
import type {TrackedRange} from './trackRange'

export type BlockDragSession = {
  editor: Editor
  range: TrackedRange
  sourcePageId: string
  movable: MovableBlocks
  count: number
}

export type ActiveBlockDrag = {session: BlockDragSession; refusal: string | null}

let activeDrag: ActiveBlockDrag | null = null

const getSyncedBlockIds = (blocks: JSONContent[]): string[] =>
  blocks.flatMap((block) => [
    ...(block.type === 'pageLinkBlock' && block.attrs?.synced
      ? [GQLID.toKey(block.attrs.pageCode, 'page')]
      : []),
    ...getSyncedBlockIds(block.content ?? [])
  ])

export const getBlockDragState = (
  session: BlockDragSession,
  refusal: string | null
): BlockDragState => ({
  sourcePageId: session.sourcePageId,
  childPageIds: session.movable.childPages.map(({pageCode}) => GQLID.toKey(pageCode, 'page')),
  syncedBlockIds: getSyncedBlockIds(session.movable.blocks),
  refusal
})

export const startBlockDrag = (
  atmosphere: Atmosphere,
  session: BlockDragSession,
  refusal: string | null
) => {
  activeDrag?.session.range.stop()
  activeDrag = {session, refusal}
  const {childPageIds, syncedBlockIds} = getBlockDragState(session, refusal)
  commitLocalUpdate(atmosphere, (store) => {
    store
      .getRoot()
      .getLinkedRecord('viewer')
      ?.setValue(session.sourcePageId, 'draggingBlocksSourcePageId')
      .setValue(childPageIds, 'draggingBlocksChildPageIds')
      .setValue(syncedBlockIds, 'draggingBlocksSyncedBlockIds')
      .setValue(refusal, 'draggingBlocksRefusal')
      .setValue(session.count, 'draggingBlocksCount')
  })
}

export const peekBlockDrag = () => activeDrag

export const takeBlockDrag = () => {
  const session = activeDrag?.session ?? null
  activeDrag = null
  return session
}

export const endBlockDrag = (atmosphere: Atmosphere) => {
  activeDrag?.session.range.stop()
  activeDrag = null
  commitLocalUpdate(atmosphere, (store) => {
    store
      .getRoot()
      .getLinkedRecord('viewer')
      ?.setValue(null, 'draggingBlocksSourcePageId')
      .setValue(null, 'draggingBlocksChildPageIds')
      .setValue(null, 'draggingBlocksSyncedBlockIds')
      .setValue(null, 'draggingBlocksRefusal')
      .setValue(null, 'draggingBlocksCount')
  })
}
