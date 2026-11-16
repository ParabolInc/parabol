import {isInSyncedBlockContent} from './isInSyncedBlockContent'

export const stopPageLinkBlockEvent = (event: Event, dom: HTMLElement) => {
  if (isInSyncedBlockContent(event.target, dom)) return true
  // only the drag handle may drag the node, so a mousedown on the node never starts one
  return event.type === 'mousedown'
}
