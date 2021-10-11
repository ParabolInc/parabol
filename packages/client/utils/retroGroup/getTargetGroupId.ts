import {DragAttribute} from '~/types/constEnums'

const getTargetGroupId = (e: MouseEvent | TouchEvent) => {
  if ((e as TouchEvent).touches) {
    const touch = (e as TouchEvent).changedTouches.item(0)
    if (!touch) return null
    let childEl = document.elementFromPoint(touch.pageX, touch.pageY)
    while (childEl && childEl.hasAttribute) {
      const reflectionGroupId = childEl.getAttribute(DragAttribute.DROPPABLE)
      if (reflectionGroupId) return reflectionGroupId
      childEl = childEl.parentElement
    }
    return null
  }
  const target = e.composedPath().find((el: any) => {
    return el.hasAttribute ? el.hasAttribute(DragAttribute.DROPPABLE) : true
  }) as HTMLDivElement
  return target.getAttribute ? target.getAttribute(DragAttribute.DROPPABLE) : null
}

export default getTargetGroupId
