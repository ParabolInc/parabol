import {
  Droppable,
  DropZoneBBox,
  TargetBBox
} from '../components/ReflectionGroup/DraggableReflectionCard'

const measureDroppableReflections = (
  dropZoneEl: HTMLDivElement | null,
  dropZoneBBox: DropZoneBBox | null,
  droppableType: Droppable
) => {
  const arr = [] as TargetBBox[]
  if (!dropZoneEl || !dropZoneBBox) return arr
  dropZoneEl.querySelectorAll(`div[${droppableType}]`).forEach((el) => {
    const targetId = el.getAttribute(droppableType)!
    const bbox = el.getBoundingClientRect()
    const {top, bottom, left, height} = bbox
    if (top >= dropZoneBBox.top && bottom <= dropZoneBBox.bottom) {
      arr.push({
        left,
        height,
        targetId,
        top,
        bottom
      })
    }
  })
  return arr
}

export default measureDroppableReflections
