import {
  ANIMATE_IN_TOTAL_DURATION,
  CARD_PADDING,
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MODAL_PADDING,
  REFLECTION_WIDTH
} from 'universal/utils/multiplayerMasonry/masonryConstants'
import {STANDARD_CURVE} from 'universal/styles/animation'
import getScaledModalBackground from 'universal/utils/multiplayerMasonry/getScaledModalBackground'

const makeResetHandler = (reflections, itemCache, modalRef) => {
  const resetQueue = reflections.map((reflection) => {
    const cachedItem = itemCache[reflection.id]
    const {
      modalEl: {style: itemStyle}
    } = cachedItem
    return () => {
      itemStyle.transition = ''
    }
  })

  const resetStyles = (e) => {
    if (e.currentTarget !== e.target) return
    resetQueue.forEach((cb) => cb())
    if (modalRef) {
      modalRef.removeEventListener('transitionend', resetStyles)
    }
  }
  return resetStyles
}

const initializeModalGrid = (
  reflections,
  parentCache,
  itemCache,
  childCache,
  headerRef,
  modalRef,
  backgroundRef
) => {
  const {
    columnLefts,
    boundingBox: {left: parentLeft, width: parentWidth, height: parentHeight, top: parentTop}
  } = parentCache
  // goal is 1 less than the grid, but at least 1, and no more than the number of reflections
  const columnCount = Math.min(reflections.length, Math.max(1, columnLefts.length - 1))

  const currentColumnHeights = new Array(columnCount).fill(0)
  const modalColumnLefts = currentColumnHeights.map((_, idx) => REFLECTION_WIDTH * idx)
  childCache.headerHeight = headerRef.getBoundingClientRect().height

  const heights = reflections.map(({id}) => {
    return itemCache[id].modalEl.getBoundingClientRect().height
  })

  // make cards animate in one at a time, but finish when the expansion does (unless there are a TON)
  const shuffleDelay =
    (ANIMATE_IN_TOTAL_DURATION - ITEM_DURATION - MIN_ITEM_DELAY) / (reflections.length - 1)
  const variableDelay = Math.max(MIN_VAR_ITEM_DELAY, shuffleDelay)
  const totalDuration = (reflections.length - 1) * variableDelay + MIN_ITEM_DELAY + ITEM_DURATION
  const animateItemQueue = reflections.map((reflection, idx) => {
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
    const delay = MIN_ITEM_DELAY + variableDelay * (reflections.length - idx - 1)
    return () => {
      itemStyle.transition = `all ${ITEM_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
      itemStyle.transform = `translate(${left}px, ${top}px)`
    }
  })

  const {boundingBox: firstReflectionBBox} = itemCache[reflections[0].id]
  const {boundingBox} = childCache
  const {top: collapsedTop, left: collapsedLeft} = boundingBox
  const {style: modalStyle} = modalRef
  const {style: backgroundStyle} = backgroundRef

  const modalHeight =
    Math.max(...currentColumnHeights) + MODAL_PADDING * 2 + childCache.headerHeight
  const modalWidth = REFLECTION_WIDTH * columnCount + (MODAL_PADDING - CARD_PADDING) * 2
  const modalTop = parentTop + (parentHeight - modalHeight) / 2
  const modalLeft = parentLeft + (parentWidth - modalWidth) / 2
  const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
  const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING

  // cache for the closing animation
  childCache.modalBoundingBox = {
    left: modalLeft,
    top: modalTop,
    width: modalWidth,
    height: modalHeight
  }

  // set initial group styles
  modalStyle.top = 0
  modalStyle.height = `${modalHeight}px`
  modalStyle.width = `${modalWidth}px`
  modalStyle.transform = `translate(${left}px,${top}px)`
  modalStyle.transformOrigin = '0 0'

  // set initial background style
  backgroundStyle.height = `${modalHeight}px`
  backgroundStyle.width = `${modalWidth}px`
  backgroundStyle.transform = getScaledModalBackground(
    modalHeight,
    modalWidth,
    firstReflectionBBox.height,
    childCache.headerHeight
  )
  backgroundStyle.transformOrigin = `${MODAL_PADDING}px ${MODAL_PADDING}px`
  backgroundStyle.backgroundColor = 'rgba(68, 66, 88, .65)'

  const resetStyles = makeResetHandler(reflections, itemCache, modalRef)

  // not sure why this is needed, but the time the modal opens, it will open from 0, 0 if this isn't double wrapped in rAFs
  // other things that work: setting the modalStyle top, left and a transform to 0,0. a setTimeout here, a forced synch layout like offsetTop
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      // set final group styles
      modalStyle.transition = `all ${totalDuration}ms ${STANDARD_CURVE}`
      modalStyle.transform = `translate(${modalLeft}px,${modalTop}px)`

      // set final background styles
      backgroundStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms ${STANDARD_CURVE}`
      backgroundStyle.transform = 'scale(1)'
      backgroundStyle.backgroundColor = 'rgba(68, 66, 88, .65)'

      // set final reflection styles
      animateItemQueue.forEach((cb) => cb())

      // reset
      modalRef.addEventListener('transitionend', resetStyles)
    })
  })
}

export default initializeModalGrid
