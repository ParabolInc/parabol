import type {Editor} from '@tiptap/core'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import {GQLID} from '../../utils/GQLID'
import type {MovableBlocks} from './getMovableBlocks'
import type {TrackedRange} from './trackRange'

export type BlockDragSession = {
  editor: Editor
  range: TrackedRange
  sourcePageId: string
  movable: MovableBlocks
  count: number
}

let activeSession: BlockDragSession | null = null

export const startBlockDrag = (
  atmosphere: Atmosphere,
  session: BlockDragSession,
  refusal: string | null
) => {
  activeSession?.range.stop()
  activeSession = session
  const childPageIds = session.movable.childPages.map(({pageCode}) => GQLID.toKey(pageCode, 'page'))
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

export const takeBlockDrag = () => {
  const session = activeSession
  activeSession = null
  return session
}

export const endBlockDrag = (atmosphere: Atmosphere) => {
  activeSession?.range.stop()
  activeSession = null
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
