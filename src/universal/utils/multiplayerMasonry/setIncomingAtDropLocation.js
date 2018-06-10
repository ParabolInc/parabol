import getLastCardForColumn from 'universal/utils/multiplayerMasonry/getLastCardForColumn'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'

const setIncomingAtDropLocation = (childrenCache, parentCache) => {
  console.log('setting incoming el at drop location')
  const {
    columnLefts,
    droppedCards,
    incomingChild: {childId, itemId}
  } = parentCache
  const childCache = childrenCache[childId]
  const droppedCardRect = droppedCards[itemId]
  const {top: initialTop, left: initialLeft, width, height} = droppedCardRect
  const distances = columnLefts.map((col) => Math.abs(col - initialLeft))
  const nearestColIdx = distances.indexOf(Math.min(...distances))
  const left = columnLefts[nearestColIdx]
  const top = getLastCardForColumn(childrenCache, left, childId)
  // TODO moved to position: fixed or adjust translation inside parent to avoid clipping (drag card is in a modal, is never clipped)
  childCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`
  childCache.boundingBox = {top, left, width, height}
  delete droppedCards[itemId]

  // TODO test if this conditional & the trigger are necessary
  if (childCache.el.parentElement) {
    // TRIGGER LAYOUT
    childCache.el.offsetTop // eslint-disable-line
    childCache.el.style.transform = `translate(${left}px, ${top}px)`
    shakeUpBottomCells(childrenCache, columnLefts)
  }
}

export default setIncomingAtDropLocation
