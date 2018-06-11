const handleSwappedGroup = (childrenCache, parentCache, snapshot) => {
  const {
    incomingChild: {childId}
  } = parentCache
  console.log('handle swap', childId)
  const {oldReflectionGroupId, left: initialLeft, top: initialTop} = snapshot
  const oldChildCache = childrenCache[oldReflectionGroupId]
  delete childrenCache[oldReflectionGroupId]

  const newChildCache = childrenCache[childId]
  const {boundingBox} = oldChildCache
  const {left, top} = boundingBox
  newChildCache.boundingBox = boundingBox
  newChildCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`

  // TRIGGER LAYOUT, definitely necessary
  newChildCache.el.offsetTop // eslint-disable-line
  newChildCache.el.style.transform = `translate(${left}px, ${top}px)`
}

export default handleSwappedGroup
