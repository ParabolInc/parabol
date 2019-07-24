import setClosingTransform from './setClosingTransform'
import {CARD_PADDING} from './masonryConstants'
import getLastCardPerColumn from './getLastCardPerColumn'
import isTempId from '../relay/isTempId'
import Atmosphere from '../../Atmosphere'
import {
  MasonryChildrenCache,
  MasonryItemCache,
  MasonryParentCache
} from '../../components/PhaseItemMasonry'

const handleDropOnGrid = (
  atmosphere: Atmosphere,
  itemCache: MasonryItemCache,
  childrenCache: MasonryChildrenCache,
  parentCache: MasonryParentCache,
  childId: string,
  itemId: string
) => {
  const {boundingBox: parentBBox, cardsInFlight, columnLefts, incomingChildren} = parentCache
  if (!parentBBox) return
  const {top: parentTop, left: parentLeft} = parentBBox
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
  const itemBBox = itemCache[itemId].boundingBox
  if (!itemBBox) return
  const {height} = itemBBox
  const x = newLeft + parentLeft + CARD_PADDING
  const y = newTop + parentTop + CARD_PADDING
  setClosingTransform(atmosphere, itemId, {x, y})
  childCache.boundingBox = {
    left: newLeft,
    top: newTop,
    height: height + 2 * CARD_PADDING
  }
  if (!childCache.el) return
  childCache.el.style.transform = `translate(${newLeft}px, ${newTop}px)`
  if (isTempId(childId)) {
    incomingChildren[itemId] = {
      boundingBox: childCache.boundingBox,
      childId
    }
  }
}

export default handleDropOnGrid
