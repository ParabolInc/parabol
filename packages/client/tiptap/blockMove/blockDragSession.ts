import type {Editor} from '@tiptap/core'
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

export const getBlockDragState = (
  session: BlockDragSession,
  refusal: string | null
): BlockDragState => ({
  sourcePageId: session.sourcePageId,
  childPageIds: session.movable.childPages.map(({pageCode}) => GQLID.toKey(pageCode, 'page')),
  refusal
})

export const startBlockDrag = (
  atmosphere: Atmosphere,
  session: BlockDragSession,
  refusal: string | null
) => {
  activeDrag?.session.range.stop()
  activeDrag = {session, refusal}
  const {childPageIds} = getBlockDragState(session, refusal)
  commitLocalUpdate(atmosphere, (store) => {
    store
      .getRoot()
      .getLinkedRecord('viewer')
      ?.setValue(session.sourcePageId, 'draggingBlocksSourcePageId')
      .setValue(childPageIds, 'draggingBlocksChildPageIds')
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
      .setValue(null, 'draggingBlocksRefusal')
      .setValue(null, 'draggingBlocksCount')
  })
}
