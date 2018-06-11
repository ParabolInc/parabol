import getLastCardForColumn from 'universal/utils/multiplayerMasonry/getLastCardForColumn'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'

const setIncomingAtInFlightLocation = (childrenCache, parentCache) => {
  console.log('setting incoming el at drop location')
  const {
    boundingBox: {left: parentLeft, top: parentTop},
    columnLefts,
    cardsInFlight,
    incomingChild: {childId, itemId}
  } = parentCache
  const childCache = childrenCache[childId]
  const inFlightCoords = cardsInFlight[itemId]
  const {x, y} = inFlightCoords
  const initialLeft = x - parentLeft
  const initialTop = y - parentTop
  childCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`
  const distances = columnLefts.map((col) => Math.abs(col - initialLeft))
  const nearestColIdx = distances.indexOf(Math.min(...distances))
  const left = columnLefts[nearestColIdx]
  const top = getLastCardForColumn(childrenCache, left, childId)
  // TODO moved to position: fixed or adjust translation inside parent to avoid clipping (drag card is in a modal, is never clipped)
  const {height, width} = childCache.el.getBoundingClientRect()
  childCache.boundingBox = {top, left, width, height}
  delete cardsInFlight[itemId]
  // TODO test if this conditional & the trigger are necessary
  if (childCache.el.parentElement) {
    // TRIGGER LAYOUT
    childCache.el.offsetTop // eslint-disable-line
    childCache.el.style.transform = `translate(${left}px, ${top}px)`
    shakeUpBottomCells(childrenCache, columnLefts)
  }
}

export default setIncomingAtInFlightLocation
