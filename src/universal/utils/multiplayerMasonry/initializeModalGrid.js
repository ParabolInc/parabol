import {
  CARD_PADDING,
  MODAL_PADDING,
  REFLECTION_WIDTH
} from 'universal/utils/multiplayerMasonry/masonryConstants'

const ANIMATE_IN_TOTAL_DURATION = 500
const ITEM_DURATION = 300
const MIN_ITEM_DELAY = 100
const MIN_VAR_ITEM_DELAY = 30

const initializeModalGrid = (reflections, parentCache, itemCache, childCache) => {
  const {
    columnLefts,
    boundingBox: {left: parentLeft, width: parentWidth, height: parentHeight, top: parentTop}
  } = parentCache
  const columnCount = Math.max(2, columnLefts.length - 1)

  const currentColumnHeights = new Array(columnCount).fill(0)
  const modalColumnLefts = currentColumnHeights.map((_, idx) => REFLECTION_WIDTH * idx)
  const heights = reflections.map((reflection) => {
    const {id} = reflection
    const cachedItem = itemCache[id]
    return cachedItem.el.getBoundingClientRect().height
  })

  // set reflection bboxes and get a thunk to create final reflection styles
  const variableDelay = Math.max(
    MIN_VAR_ITEM_DELAY,
    (ANIMATE_IN_TOTAL_DURATION - ITEM_DURATION - MIN_ITEM_DELAY) / (reflections.length - 1)
  )
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
      el: {style: itemStyle}
    } = cachedItem
    return () => {
      itemStyle.transition = `all ${ITEM_DURATION}ms ${MIN_ITEM_DELAY + variableDelay * idx}ms`
      itemStyle.transform = `translate(${left}px, ${top}px)`
      itemStyle.opacity = 1
    }
  })

  const modalHeight = Math.max(...currentColumnHeights) + MODAL_PADDING * 2
  const childTop = parentTop + (parentHeight - modalHeight) / 2
  const {
    boundingBox: {height: collapsedHeight, top: collapsedTop, left: collapsedLeft},
    el: {style: childStyle}
  } = childCache
  const modalWidth = REFLECTION_WIDTH * Math.min(columnCount, reflections.length) + MODAL_PADDING
  const childLeft = parentLeft + (parentWidth - modalWidth) / 2
  const top = collapsedTop + parentTop
  const left = collapsedLeft + parentLeft

  // the offset is the relative location of the collapsed group to the modal. if the modal is to the right, they come in from the left
  const offsetLeft = left + CARD_PADDING - (childLeft + MODAL_PADDING)
  const offsetTop = top + CARD_PADDING - (childTop + MODAL_PADDING)

  // set initial reflection styles
  reflections.forEach((reflection) => {
    const {
      el: {style: itemStyle}
    } = itemCache[reflection.id]
    itemStyle.transition = `unset`
    itemStyle.transform = `translate(${offsetLeft}px, ${offsetTop}px)`
    itemStyle.opacity = 0
  })

  // set initial group styles
  const scaleX = REFLECTION_WIDTH / modalWidth
  const scaleY = collapsedHeight / modalHeight
  childStyle.transition = 'unset'
  childStyle.top = `${top}px`
  childStyle.left = `${left}px`
  childStyle.height = `${modalHeight}px`
  childStyle.width = `${modalWidth}px`
  childStyle.transformOrigin = '0 0'
  childStyle.transform = `translate(${0}px,${0}px)scale(${scaleX},${scaleY})`

  window.requestAnimationFrame(() => {
    // set final group styles
    childStyle.transition = `all ${ANIMATE_IN_TOTAL_DURATION}ms`
    childStyle.backgroundColor = 'rgba(0,0,0,0.6)'
    childStyle.transform = `translate(${childLeft - left}px,${childTop - top}px)scale(1)`
    // set final reflection styles
    animateItemQueue.forEach((cb) => cb())
  })
}

export default initializeModalGrid
