import {
  ANIMATE_IN_TOTAL_DURATION,
  CARD_PADDING,
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MODAL_PADDING,
  REFLECTION_WIDTH
} from 'universal/utils/multiplayerMasonry/masonryConstants'

const initializeModalGrid = (
  reflections,
  parentCache,
  itemCache,
  childCache,
  headerRef,
  modalRef
) => {
  const {
    columnLefts,
    boundingBox: {left: parentLeft, width: parentWidth, height: parentHeight, top: parentTop}
  } = parentCache
  const columnCount = Math.max(2, columnLefts.length - 1)

  const currentColumnHeights = new Array(columnCount).fill(0)
  const modalColumnLefts = currentColumnHeights.map((_, idx) => REFLECTION_WIDTH * idx)
  const {height: headerHeight} = headerRef.getBoundingClientRect()
  const reversedRefelctions = reflections.slice().reverse()
  const heights = reversedRefelctions.map((reflection) => {
    const {id} = reflection
    const cachedItem = itemCache[id]
    return cachedItem.modalEl.getBoundingClientRect().height
  })

  // set reflection bboxes and get a thunk to create final reflection styles
  const variableDelay = Math.max(
    MIN_VAR_ITEM_DELAY,
    (ANIMATE_IN_TOTAL_DURATION - ITEM_DURATION - MIN_ITEM_DELAY) / (reflections.length - 1)
  )
  const animateItemQueue = reversedRefelctions.map((reflection, idx) => {
    const cachedItem = itemCache[reflection.id]
    const top = Math.min(...currentColumnHeights)
    const shortestColumnIdx = currentColumnHeights.indexOf(top)
    const left = modalColumnLefts[shortestColumnIdx]
    const height = heights[idx]
    cachedItem.boundingBox = {
      height,
      top,
      left
    }
    currentColumnHeights[shortestColumnIdx] += height
    const {
      modalEl: {style: itemStyle}
    } = cachedItem
    return () => {
      itemStyle.transition = `all ${ITEM_DURATION}ms ${MIN_ITEM_DELAY + variableDelay * idx}ms`
      itemStyle.transform = `translate(${left}px, ${top}px)`
    }
  })

  const resetQueue = reversedRefelctions.map((reflection) => {
    const cachedItem = itemCache[reflection.id]
    const {
      modalEl: {style: itemStyle}
    } = cachedItem
    return () => {
      itemStyle.transition = ''
    }
  })
  const modalHeight = Math.max(...currentColumnHeights) + MODAL_PADDING * 2 + headerHeight
  const childTop = parentTop + (parentHeight - modalHeight) / 2
  const {
    boundingBox: {top: collapsedTop, left: collapsedLeft}
  } = childCache
  const modalWidth =
    REFLECTION_WIDTH * Math.min(columnCount, reflections.length) +
    (MODAL_PADDING - CARD_PADDING) * 2
  const childLeft = parentLeft + (parentWidth - modalWidth) / 2
  const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
  const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING

  // set initial group styles
  const {style: modalStyle} = modalRef
  // childEl.style.opacity= 0
  modalStyle.transition = 'unset'
  modalStyle.top = `${top}px`
  modalStyle.left = `${left}px`
  modalStyle.height = `${modalHeight}px`
  modalStyle.width = `${modalWidth}px`
  modalStyle.transformOrigin = '0 0'
  modalStyle.transform = `translate(${0}px,${0}px)`

  window.requestAnimationFrame(() => {
    // set final group styles
    modalStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms`
    modalStyle.backgroundColor = 'rgba(68, 66, 88, 0.65)'
    modalStyle.transform = `translate(${childLeft - left}px,${childTop - top}px)scale(1)`
    // set final reflection styles
    animateItemQueue.forEach((cb) => cb())
    const resetStyles = (e) => {
      if (e.currentTarget !== e.target) return
      resetQueue.forEach((cb) => cb())
      modalRef.removeEventListener('transitionend', resetStyles)
    }
    modalRef.addEventListener('transitionend', resetStyles)
  })
}

export default initializeModalGrid
