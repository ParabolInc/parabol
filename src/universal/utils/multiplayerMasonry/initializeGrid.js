import {REFLECTION_WIDTH} from 'universal/components/PhaseItemMasonry'

const OFFSET_DELAY = 50
const DURATION = 400

const initializeGrid = (childrenCache, parentCache, isAnimated) => {
  const gridBox = parentCache.el.getBoundingClientRect()
  const childrenKeys = Object.keys(childrenCache)
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
    // only thing we really care about here is height?
    const {height, width} = childCache.boundingBox || el.getBoundingClientRect()
    const top = Math.min(...currentColumnHeights)
    const shortestColumnIdx = currentColumnHeights.indexOf(top)
    const left = parentCache.columnLefts[shortestColumnIdx]
    childCache.boundingBox = {
      height,
      width,
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
      setTimeout(() => {
        animateOutQueue.forEach((cb) => cb())
      }, DURATION + OFFSET_DELAY * animateOutQueue.length)
    } else {
      animateOutQueue.forEach((cb) => cb())
    }
  })
}

export default initializeGrid
