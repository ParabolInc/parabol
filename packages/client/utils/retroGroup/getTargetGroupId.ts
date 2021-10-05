import {DragAttribute} from '~/types/constEnums'

const getTargetGroupId = (
  e: MouseEvent | TouchEvent,
  droppableType: DragAttribute.DROPPABLE | null
) => {
  if (!droppableType) return null
  if ((e as TouchEvent).touches) {
    const touch = (e as TouchEvent).changedTouches.item(0)
    if (!touch) return null
    let childEl = document.elementFromPoint(touch.pageX, touch.pageY)
    while (childEl && childEl.hasAttribute) {
      const reflectionGroupId = childEl.getAttribute(droppableType)
      if (reflectionGroupId) return reflectionGroupId
      childEl = childEl.parentElement
    }
    return null
  }
  const target = e.composedPath().find((el: any) => {
    return el.hasAttribute ? el.hasAttribute(droppableType) : true
  }) as HTMLDivElement
  return target.getAttribute ? target.getAttribute(droppableType) : null
}

export default getTargetGroupId
