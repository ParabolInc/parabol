const getTargetGroupId = (e: MouseEvent | TouchEvent) => {
  const target = e.composedPath().find((el: any) => {
    return el.hasAttribute('data-droppable') || el.id === 'root'
  }) as HTMLDivElement
  return target.id === 'root' ? null : target.getAttribute('data-droppable')
}

export default getTargetGroupId
