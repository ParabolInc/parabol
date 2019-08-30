const getTargetGroupId = (e: MouseEvent | TouchEvent) => {
  const target = e.composedPath().find((el: any) => {
      return el.hasAttribute ? el.hasAttribute('data-droppable') : true
  }) as HTMLDivElement
  return target.getAttribute ? target.getAttribute('data-droppable') : null
}

export default getTargetGroupId
