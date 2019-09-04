import {ReflectionDragState} from '../components/ReflectionGroup/DraggableReflectionCard'
import measureDroppableReflections from './measureDroppableReflections'
import findDropZoneInPath from './findDropZoneInPath'

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


const maybeStartReflectionScroll = (drag: ReflectionDragState, path: EventTarget[]) => {
  const dropZoneEl = findDropZoneInPath(path)

  // if the cursor isn't hovering a dropZoneEl, don't scroll
  if (!dropZoneEl) {
    drag.dropZoneEl = null
    drag.dropZoneBBox = null
    return
  }

  // if it's a new dropzone, measure it & see if it can scroll
  if (dropZoneEl !== drag.dropZoneEl) {
    // set up dropZone
    drag.dropZoneEl = dropZoneEl
    // if the cursor is close to the top & not at the top or close to but not at bottom
    drag.dropZoneBBox = dropZoneEl.getBoundingClientRect()
    // if the dropZoneEl has no scroll bars, don't scroll
    const {scrollHeight, clientHeight} = dropZoneEl
    if (scrollHeight <= clientHeight) return
    scheduleScroll(drag, dropZoneEl)
  }
}

export default maybeStartReflectionScroll
