import {DragAttribute} from '../types/constEnums'

const findDropZoneFromEvent = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e) {
    const touch = e.changedTouches.item(0)
    if (!touch) return null
    let childEl = document.elementFromPoint(touch.pageX, touch.pageY)
    while (childEl && childEl.hasAttribute) {
      if (childEl.hasAttribute(DragAttribute.DROPZONE)) return childEl as HTMLDivElement
      childEl = childEl.parentElement
    }
    return null
  }
  return e.composedPath().find((el: any) => {
    return el.hasAttribute && el.hasAttribute(DragAttribute.DROPZONE)
  }) as HTMLDivElement | null
}

export default findDropZoneFromEvent
