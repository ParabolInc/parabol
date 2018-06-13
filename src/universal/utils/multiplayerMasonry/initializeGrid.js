import {REFLECTION_WIDTH} from 'universal/components/PhaseItemMasonry'

const OFFSET_DELAY = 50
const DURATION = 400

const initializeGrid = (childrenCache, parentCache, isAnimated) => {
  const childrenKeys = Object.keys(childrenCache)
  // minimize forced layout reflows by doing all the expensive reads up front
  const heights = childrenKeys.map((childKey) => {
    const childCache = childrenCache[childKey]
    const {el} = childCache
    return childCache.boundingBox
      ? childCache.boundingBox.height
      : el.getBoundingClientRect().height
  })
  const gridBox = parentCache.el.getBoundingClientRect()
  const columnCount = Math.floor(gridBox.width / REFLECTION_WIDTH)
  const leftMargin = (gridBox.width - columnCount * REFLECTION_WIDTH) / 2
  const currentColumnHeights = new Array(columnCount).fill(0)
  parentCache.boundingBox = gridBox
  parentCache.columnLefts = currentColumnHeights.map(
    (_, idx) => REFLECTION_WIDTH * idx + leftMargin
  )

  const animateInQueue = []
  const animateOutQueue = []

  childrenKeys.forEach((childKey, idx) => {
    const childCache = childrenCache[childKey]
    const {el} = childCache
    const top = Math.min(...currentColumnHeights)
    const shortestColumnIdx = currentColumnHeights.indexOf(top)
    const left = parentCache.columnLefts[shortestColumnIdx]
    const height = heights[idx]
    childCache.boundingBox = {
      height,
      top,
      left
    }
    currentColumnHeights[shortestColumnIdx] += height
    if (isAnimated) {
      el.style.transition = 'unset'
      el.style.transform = `translate(${left}px, ${top}px)scale(0)`
      el.style.opacity = 0
      animateInQueue.push(() => {
        el.style.opacity = ''
        el.style.transition = `all ${DURATION}ms ${idx * OFFSET_DELAY}ms`
        el.style.transform = `translate(${left}px, ${top}px)scale(1)`
      })
    }
    animateOutQueue.push(() => {
      el.style.transition = ''
      el.style.transform = `translate(${left}px, ${top}px)`
    })
  })
  window.requestAnimationFrame(() => {
    if (isAnimated) {
      animateInQueue.forEach((cb) => cb())
      const lastChildKey = childrenKeys[childrenKeys.length - 1]
      const {el} = childrenCache[lastChildKey]
      const wrapUp = () => {
        animateOutQueue.forEach((cb) => cb())
        el.removeEventListener('transitionend', wrapUp)
      }
      el.addEventListener('transitionend', wrapUp)
    } else {
      animateOutQueue.forEach((cb) => cb())
    }
  })
}

export default initializeGrid
