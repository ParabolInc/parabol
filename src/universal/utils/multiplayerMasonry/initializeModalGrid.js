import {
  ANIMATE_IN_TOTAL_DURATION,
  CARD_PADDING,
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MODAL_PADDING,
  REFLECTION_WIDTH
} from 'universal/utils/multiplayerMasonry/masonryConstants'

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

// const resizeModalGrid = (
//   reflections,
//   parentCache,
//   itemCache,
//   childCache,
//   headerRef,
//   modalRef,
//   backgroundRef,
//   newReflection
// ) => {
//   const {
//     columnLefts,
//     boundingBox: {left: parentLeft, width: parentWidth, height: parentHeight, top: parentTop}
//   } = parentCache
//   // goal is 1 less than the grid, but at least 1, and no more than the number of reflections
//   const columnCount = Math.min(reflections.length, Math.max(1, columnLefts.length - 1))
//
//   const currentColumnHeights = new Array(columnCount).fill(0)
//   const modalColumnLefts = currentColumnHeights.map((_, idx) => REFLECTION_WIDTH * idx)
//   const {height: headerHeight} = headerRef.getBoundingClientRect()
//   const heights = reflections.map(({id}) => itemCache[id].modalEl.getBoundingClientRect().height)
//
//   // make cards animate in one at a time, but finish when the expansion does (unless there are a TON)
//   const shuffleDelay =
//     (ANIMATE_IN_TOTAL_DURATION - ITEM_DURATION - MIN_ITEM_DELAY) / (reflections.length - 1)
//   const variableDelay = Math.max(MIN_VAR_ITEM_DELAY, shuffleDelay)
//
//   const animateItemQueue = reflections.map((reflection, idx) => {
//     const cachedItem = itemCache[reflection.id]
//     const top = Math.min(...currentColumnHeights)
//     const shortestColumnIdx = currentColumnHeights.indexOf(top)
//     const left = modalColumnLefts[shortestColumnIdx]
//     const height = heights[idx]
//     cachedItem.boundingBox = {
//       height,
//       top,
//       left
//     }
//     currentColumnHeights[shortestColumnIdx] += height
//     const {
//       modalEl: {style: itemStyle}
//     } = cachedItem
//     return () => {
//       itemStyle.transition = `all ${ITEM_DURATION}ms ${MIN_ITEM_DELAY +
//       variableDelay * (reflections.length - idx - 1)}ms`
//       itemStyle.transform = `translate(${left}px, ${top}px)`
//     }
//   })
//
//   const {boundingBox: firstReflectionBBox} = itemCache[reflections[0].id]
//   const {boundingBox} = childCache
//   const {top: collapsedTop, left: collapsedLeft} = boundingBox
//   const {style: modalStyle} = modalRef
//   const {style: backgroundStyle} = backgroundRef
//
//   const modalHeight = Math.max(...currentColumnHeights) + MODAL_PADDING * 2 + headerHeight
//   const modalWidth = REFLECTION_WIDTH * columnCount + (MODAL_PADDING - CARD_PADDING) * 2
//   const childTop = parentTop + (parentHeight - modalHeight) / 2
//   const childLeft = parentLeft + (parentWidth - modalWidth) / 2
//   const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
//   const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING
//
//   // cache for the closing animation
//   childCache.scaleX = (REFLECTION_WIDTH + CARD_PADDING * 2) / modalWidth
//   childCache.scaleY = (firstReflectionBBox.height + headerHeight + MODAL_PADDING) / modalHeight
//
//   // set initial group styles
//   modalStyle.transition = 'unset'
//   // modalStyle.top = `${top}px`
//   // modalStyle.left = `${left}px`
//   modalStyle.height = `${modalHeight}px`
//   modalStyle.width = `${modalWidth}px`
//   modalStyle.transform = `translate(${0}px,${0}px)`
//   modalStyle.transformOrigin = '0 0'
//
//   // set initial background style
//   backgroundStyle.height = `${modalHeight}px`
//   backgroundStyle.width = `${modalWidth}px`
//   backgroundStyle.transform = `matrix(${childCache.scaleX}}, 0, 0, ${childCache.scaleY}, 0, 0)` // `scale(${childCache.scaleX},${childCache.scaleY})`
//   backgroundStyle.transformOrigin = `${MODAL_PADDING}px ${headerHeight +
//   firstReflectionBBox.height}px`
//   // backgroundStyle.willChange = 'transform'
//
//   const resetStyles = makeResetHandler(reflections, itemCache, modalRef)
//   window.requestAnimationFrame(() => {
//     // set final group styles
//     modalStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms`
//     modalStyle.transform = `translate(${childLeft - left}px,${childTop - top}px)scale(1)`
//
//     // set final background styles
//     backgroundStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms`
//     backgroundStyle.transform = `matrix(1,0,0,1,0,0)` // `scale(1)`
//     backgroundStyle.backgroundColor = 'rgba(68, 66, 88, .65)'
//
//     // set final reflection styles
//     animateItemQueue.forEach((cb) => cb())
//
//     // reset
//     modalRef.addEventListener('transitionend', resetStyles)
//   })
// }

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
  const {height: headerHeight} = headerRef.getBoundingClientRect()

  const heights = reflections.map(({id}) => {
    // const cachedItem = itemCache[id]
    // if (!cachedItem.modalEl) debugger
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
    return () => {
      itemStyle.transition = `all ${ITEM_DURATION}ms ${MIN_ITEM_DELAY +
        variableDelay * (reflections.length - idx - 1)}ms`
      itemStyle.transform = `translate(${left}px, ${top}px)`
    }
  })

  const {boundingBox: firstReflectionBBox} = itemCache[reflections[0].id]
  const {boundingBox} = childCache
  const {top: collapsedTop, left: collapsedLeft} = boundingBox
  const {style: modalStyle} = modalRef
  const {style: backgroundStyle} = backgroundRef

  const modalHeight = Math.max(...currentColumnHeights) + MODAL_PADDING * 2 + headerHeight
  const modalWidth = REFLECTION_WIDTH * columnCount + (MODAL_PADDING - CARD_PADDING) * 2
  const childTop = parentTop + (parentHeight - modalHeight) / 2
  const childLeft = parentLeft + (parentWidth - modalWidth) / 2
  const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
  const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING

  // cache for the closing animation
  childCache.scaleX = (REFLECTION_WIDTH + CARD_PADDING * 2) / modalWidth
  childCache.scaleY = (firstReflectionBBox.height + headerHeight + MODAL_PADDING) / modalHeight

  // set initial group styles
  modalStyle.transition = 'unset'
  modalStyle.top = `${top}px`
  modalStyle.left = `${left}px`
  modalStyle.height = `${modalHeight}px`
  modalStyle.width = `${modalWidth}px`
  modalStyle.transform = `translate(${0}px,${0}px)`
  modalStyle.transformOrigin = '0 0'

  // set initial background style
  backgroundStyle.height = `${modalHeight}px`
  backgroundStyle.width = `${modalWidth}px`
  backgroundStyle.transform = `scale(${childCache.scaleX}, ${childCache.scaleY})`
  backgroundStyle.transformOrigin = `${MODAL_PADDING}px ${MODAL_PADDING}px`
  backgroundStyle.backgroundColor = 'rgba(68, 66, 88, .65)'

  // backgroundStyle.willChange = 'transform'

  const resetStyles = makeResetHandler(reflections, itemCache, modalRef)
  window.requestAnimationFrame(() => {
    // set final group styles
    modalStyle.transition = `all ${totalDuration}ms`
    modalStyle.transform = `translate(${childLeft - left}px,${childTop - top}px)scale(1)`

    // set final background styles
    backgroundStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms`
    backgroundStyle.transform = 'scale(1)'
    backgroundStyle.backgroundColor = 'rgba(68, 66, 88, .65)'

    // set final reflection styles
    animateItemQueue.forEach((cb) => cb())

    // reset
    modalRef.addEventListener('transitionend', resetStyles)
  })
}

export default initializeModalGrid
