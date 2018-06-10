import setIncomingAtDropLocation from 'universal/utils/multiplayerMasonry/setIncomingAtDropLocation'

const handleSwappedGroup = (childrenCache, parentCache, snapshot) => {
  const {
    incomingChild: {childId, itemId},
    droppedCards
  } = parentCache
  console.log('handle swap', droppedCards)
  const {oldReflectionGroupId, left: initialLeft, top: initialTop} = snapshot
  console.log('compare', droppedCards, initialLeft, initialTop)
  if (droppedCards[itemId]) {
    // the droppedCardRect didn't come fast enough for handleNewGroup, but it is here now!
    setIncomingAtDropLocation(childrenCache, parentCache)
  }
  const oldChildCache = childrenCache[oldReflectionGroupId]
  const newChildCache = childrenCache[childId]
  newChildCache.boundingBox = oldChildCache.boundingBox
  newChildCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`
  delete childrenCache[oldReflectionGroupId]
  const {
    boundingBox: {left, top}
  } = newChildCache
  // TRIGGER LAYOUT, definitely necessary
  newChildCache.el.offsetTop // eslint-disable-line
  newChildCache.el.style.transform = `translate(${left}px, ${top}px)`
}

export default handleSwappedGroup
