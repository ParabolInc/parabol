import {CARD_PADDING, MODAL_PADDING, REFLECTION_WIDTH} from './masonryConstants'

const updateReflectionsInModal = (
  reflections,
  parentCache,
  itemCache,
  childCache,
  headerRef,
  modalRef,
  backgroundRef,
  itemIds
) => {
  const {
    columnLefts,
    boundingBox: {left: parentLeft, width: parentWidth, height: parentHeight, top: parentTop}
  } = parentCache
  const columnCount = Math.min(reflections.length, Math.max(1, columnLefts.length - 1))
  const currentColumnHeights = new Array(columnCount).fill(0)
  const modalColumnLefts = currentColumnHeights.map((_, idx) => REFLECTION_WIDTH * idx)
  const {headerHeight} = childCache
  const newItemHeights = itemIds.map((itemId) => itemCache[itemId].boundingBox.height)

  reflections.forEach((reflection) => {
    const cachedItem = itemCache[reflection.id]
    const {
      boundingBox,
      modalEl: {style: itemStyle}
    } = cachedItem
    const top = Math.min(...currentColumnHeights)
    const shortestColumnIdx = currentColumnHeights.indexOf(top)
    const left = modalColumnLefts[shortestColumnIdx]
    const itemIdsIdx = itemIds.findIndex((itemId) => itemId === reflection.id)
    const isExisting = itemIdsIdx === -1
    if (isExisting) {
      boundingBox.left = left
      boundingBox.top = top
    } else {
      const height = newItemHeights[itemIdsIdx]
      cachedItem.boundingBox = {
        height,
        top,
        left
      }
      // if this is a drop, let the inflight card be the animation
      itemStyle.transition = 'unset'
    }
    currentColumnHeights[shortestColumnIdx] += cachedItem.boundingBox.height + CARD_PADDING * 2
    itemStyle.transform = `translate(${left}px, ${top}px)`
  })

  const {style: modalStyle} = modalRef
  const {style: backgroundStyle} = backgroundRef

  const modalHeight = Math.max(...currentColumnHeights) + MODAL_PADDING * 2 + headerHeight
  const modalWidth = REFLECTION_WIDTH * columnCount + (MODAL_PADDING - CARD_PADDING) * 2
  const childTop = parentTop + (parentHeight - modalHeight) / 2
  const childLeft = parentLeft + (parentWidth - modalWidth) / 2

  // cache for the closing animation
  childCache.modalBoundingBox.top = childTop
  childCache.modalBoundingBox.left = childLeft

  // set group styles. animating height & width is expensive & loses fps, but this is rare
  modalStyle.height = `${modalHeight}px`
  modalStyle.width = `${modalWidth}px`
  modalStyle.transform = `translate(${childLeft}px,${childTop}px)`
  // set initial background style
  backgroundStyle.height = `${modalHeight}px`
  backgroundStyle.width = `${modalWidth}px`
}

export default updateReflectionsInModal
