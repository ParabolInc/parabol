import type {BlockDragState} from '../../blockMove/getBlockDropRefusal'

export const getCopyDragState = (copiedPageId: string): BlockDragState => ({
  sourcePageId: copiedPageId,
  childPageIds: [copiedPageId],
  refusal: null
})
