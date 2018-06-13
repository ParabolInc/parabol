import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import {CARD_PADDING, REFLECTION_WIDTH} from 'universal/components/PhaseItemMasonry'
import getLastCardPerColumn from 'universal/utils/multiplayerMasonry/getLastCardPerColumn'

const handleDropOnGrid = (atmosphere, childrenCache, parentCache, childCache, itemId) => {
  const {
    boundingBox: {top: parentTop, left: parentLeft},
    cardsInFlight,
    columnLefts,
    incomingChildren
  } = parentCache
  const {x: dropX, y: dropY} = cardsInFlight[itemId]
  const droppedLeft = dropX - parentLeft
  const droppedTop = dropY - parentTop
  const lastCardPerColumn = getLastCardPerColumn(childrenCache, columnLefts)

  const bottomCoords = columnLefts.map((left) => {
    const bottomCard = lastCardPerColumn[left]
    const top = bottomCard ? bottomCard.boundingBox.top + bottomCard.boundingBox.height : 0
    return {left, top}
  })

  const distances = bottomCoords.map(
    ({left, top}) => Math.abs(left - droppedLeft) + Math.abs(top - droppedTop)
  )
  const minDistanceIdx = distances.indexOf(Math.min(...distances))
  const {left: newLeft, top: newTop} = bottomCoords[minDistanceIdx]
  const {height} = childCache.itemEl.getBoundingClientRect()
  setClosingTransform(
    atmosphere,
    itemId,
    newLeft + parentLeft + CARD_PADDING,
    newTop + parentTop + CARD_PADDING
  )
  incomingChildren[itemId] = {
    boundingBox: {
      left: newLeft,
      top: newTop,
      width: REFLECTION_WIDTH,
      height: height + 2 * CARD_PADDING
    },
    childId: null
  }
}

export default handleDropOnGrid
