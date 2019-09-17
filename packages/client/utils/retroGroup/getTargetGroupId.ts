const getTargetGroupId = (e: MouseEvent | TouchEvent) => {
  if ((e as TouchEvent).touches) {
    const touch = (e as TouchEvent).changedTouches.item(0)
    if (!touch) return null
    let childEl = document.elementFromPoint(touch.pageX, touch.pageY)
    while (childEl && childEl.hasAttribute) {
      const reflectionGroupId = childEl.getAttribute('data-droppable')
      if (reflectionGroupId) return reflectionGroupId
      childEl = childEl.parentElement
    }
    return null
  }
  const target = e.composedPath().find((el: any) => {
      return el.hasAttribute ? el.hasAttribute('data-droppable') : true
  }) as HTMLDivElement
  return target.getAttribute ? target.getAttribute('data-droppable') : null
}

export default getTargetGroupId
