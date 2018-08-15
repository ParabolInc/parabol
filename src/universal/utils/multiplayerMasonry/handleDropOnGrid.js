import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import {CARD_PADDING} from 'universal/utils/multiplayerMasonry/masonryConstants'
import getLastCardPerColumn from 'universal/utils/multiplayerMasonry/getLastCardPerColumn'
import isTempId from 'universal/utils/relay/isTempId'

const handleDropOnGrid = (atmosphere, itemCache, childrenCache, parentCache, childId, itemId) => {
  const {
    boundingBox: {top: parentTop, left: parentLeft},
    cardsInFlight,
    columnLefts,
    incomingChildren
  } = parentCache
  const childCache = childrenCache[childId]
  const {x: dropX, y: dropY} = cardsInFlight[itemId]
  const droppedLeft = dropX - parentLeft
  const droppedTop = dropY - parentTop
  const lastCardPerColumn = getLastCardPerColumn(childrenCache, columnLefts)

  const bottomCoords = columnLefts.map((left) => {
    const bottomCard = lastCardPerColumn[left]
    const top = bottomCard ? bottomCard.boundingBox.top + bottomCard.boundingBox.height : 0
    return {left, top}
  })

  const distances = bottomCoords.map(({left, top}) =>
    Math.sqrt(Math.abs(left - droppedLeft) ** 2 + Math.abs(top - droppedTop) ** 2)
  )
  const minDistanceIdx = distances.indexOf(Math.min(...distances))
  const {left: newLeft, top: newTop} = bottomCoords[minDistanceIdx]
  const {height} = itemCache[itemId].boundingBox
  const x = newLeft + parentLeft + CARD_PADDING
  const y = newTop + parentTop + CARD_PADDING
  setClosingTransform(atmosphere, itemId, {x, y})
  childCache.boundingBox = {
    left: newLeft,
    top: newTop,
    height: height + 2 * CARD_PADDING
  }
  childCache.el.style.transform = `translate(${newLeft}px, ${newTop}px)`
  if (isTempId(childId)) {
    incomingChildren[itemId] = {
      boundingBox: childCache.boundingBox,
      childId
    }
  }
}

export default handleDropOnGrid
