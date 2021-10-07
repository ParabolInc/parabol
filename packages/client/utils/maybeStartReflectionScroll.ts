import {ReflectionDragState} from '../components/ReflectionGroup/DraggableReflectionCard'
import measureDroppableReflections from './measureDroppableReflections'

const SCROLL_MULTIPLIER = 25
const scheduleScroll = (drag: ReflectionDragState, initialDropZoneEl: HTMLDivElement) => {
  const scroll = (isChange: boolean) => {
    requestAnimationFrame(() => {
      if (isChange) {
        drag.targets = measureDroppableReflections(drag.dropZoneEl, drag.dropZoneBBox)
      }
      scheduleScroll(drag, initialDropZoneEl)
    })
  }
  const {isDrag, clientY, dropZoneEl, dropZoneBBox} = drag
  if (!isDrag || dropZoneEl !== initialDropZoneEl) return
  const {height, top, bottom} = dropZoneBBox!
  const {clientHeight, scrollHeight, scrollTop} = dropZoneEl
  const buffer = height / 4 // begin scrolling when cursor reaches the top/bottom 25%
  let isChange = true
  if (scrollTop > 0 && clientY < top + buffer) {
    // scroll up
    const str = (top + buffer - clientY) / buffer
    dropZoneEl.scrollTop -= Math.max(1, SCROLL_MULTIPLIER * str)
  } else if (scrollTop + clientHeight < scrollHeight && clientY > bottom - buffer) {
    const str = 1 - (bottom - clientY) / buffer
    dropZoneEl.scrollTop += Math.max(1, SCROLL_MULTIPLIER * str)
  } else {
    isChange = false
  }
  scroll(isChange)
}

const maybeStartReflectionScroll = (drag: ReflectionDragState) => {
  const dropZoneEl = drag.dropZoneEl!
  const {scrollHeight, clientHeight} = dropZoneEl
  if (scrollHeight <= clientHeight) return
  scheduleScroll(drag, dropZoneEl)
}

export default maybeStartReflectionScroll
