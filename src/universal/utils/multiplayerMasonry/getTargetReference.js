import {REFLECTION_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'

// The following improves accuracy by predicting where the cursor is headed, not where it is

// const getSpeed = (history) => {
//   if (history.length === 1) return 0
//   const delta = history[history.length - 1].x - history[0].x
//   return delta / history.length
// }
//
// const getLinearRegression = (history) => {
//   if (history.length === 1) return {m: 0, b: history[0].y}
//   let sumX = 0
//   let sumY = 0
//   let sumXX = 0
//   let sumXY = 0
//   for (let i = 0; i < history.length; i++) {
//     const point = history[i]
//     const {x, y} = point
//     sumX += x
//     sumY += y
//     sumXX += x * x
//     sumXY += x * y
//   }
//   const m = ((history.length * sumXY) - (sumX * sumY)) / ((history.length * sumXX) - (sumX * sumX))
//   const b = (sumY / history.length) - ((m * sumX) / history.length)
//   return {m, b}
// }
//
// const FORECAST_PERIODS = 40
//
// // assume the reference coordinate is somewhere in the future to avoid cards that we just left
// // Current position:  o--x-----------o
// // Forecast position: o---------x----o
// const getReferenceCoord = (history) => {
//   // return history[history.length -1]
//   const speed = getSpeed(history)
//   const {m, b} = getLinearRegression(history)
//   const x= history[history.length - 1].x + FORECAST_PERIODS * speed
//   const y = m * x+ b
//   return {x, y}
// }

// increasing this increases the probability that the targetId is not the nearest
const SWITCHING_COST = 50

// if it's clear they aren't near a card, don't try to force a relative position
const MAX_DIST = REFLECTION_WIDTH

const getTargetReference = (
  childrenCache,
  parentCache,
  cursorCoords,
  cursorOffset,
  prevChildId
) => {
  const {
    boundingBox: {left: parentLeft, top: parentTop}
  } = parentCache
  const relativeX = cursorCoords.x - parentLeft
  const relativeY = cursorCoords.y - parentTop
  const childKeys = Object.keys(childrenCache)
  const distances = []
  for (let i = 0; i < childKeys.length; i++) {
    const childKey = childKeys[i]
    const childCache = childrenCache[childKey]
    const {boundingBox} = childCache
    if (boundingBox) {
      distances[i] = 1e6
    }
    const centroidX = boundingBox.left + REFLECTION_WIDTH / 2
    const centroidY = boundingBox.top + boundingBox.height / 2
    const deltaX = centroidX - relativeX
    const deltaY = centroidY - relativeY
    // favor the existing reference to reduce jitter
    const loyaltyDiscount = childKey === prevChildId ? SWITCHING_COST : 0

    // distance is from cursor to card centroid
    distances[i] = Math.sqrt(Math.abs(deltaX) ** 2 + Math.abs(deltaY) ** 2) - loyaltyDiscount
  }
  const minValue = Math.min(...distances)

  // if they were off the grid, require them to get very close to a card so we can assume they're back on the grid
  const relativePlacementThresh = prevChildId ? MAX_DIST : MAX_DIST / 2
  if (minValue > relativePlacementThresh) return {}
  const minIdx = distances.indexOf(minValue)
  const minChildKey = childKeys[minIdx]
  const {
    boundingBox: {left, top}
  } = childrenCache[minChildKey]

  return {
    targetId: minChildKey,
    targetOffset: {
      // offset is from window to top left of component
      x: left - relativeX + cursorOffset.x,
      y: top - relativeY + cursorOffset.y
    }
  }
}

export default getTargetReference
