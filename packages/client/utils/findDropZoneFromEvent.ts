import {DropZone} from '~/components/ReflectionGroup/DraggableReflectionCard'

const findDropZoneFromEvent = (e: MouseEvent | TouchEvent, dropzoneType: DropZone) => {
  if ((e as TouchEvent).touches) {
    const touch = (e as TouchEvent).changedTouches.item(0)
    if (!touch) return null
    let childEl = document.elementFromPoint(touch.pageX, touch.pageY)
    while (childEl && childEl.hasAttribute) {
      if (childEl.hasAttribute(dropzoneType)) return childEl as HTMLDivElement
      childEl = childEl.parentElement
    }
    return null
  }
  return e.composedPath().find((el: any) => {
    return el.hasAttribute && el.hasAttribute(dropzoneType)
  }) as HTMLDivElement | null
}

export default findDropZoneFromEvent
