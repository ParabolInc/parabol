const initializeGrid = (childrenCache, parentCache, cardWidth) => {
  const gridBox = parentCache.el.getBoundingClientRect()
  const childrenKeys = Object.keys(childrenCache)
  const columnCount = Math.floor(gridBox.width / cardWidth)
  const leftMargin = (gridBox.width - columnCount * cardWidth) / 2
  const currentColumnHeights = new Array(columnCount).fill(0)
  parentCache.boundingBox = gridBox
  parentCache.columnLefts = currentColumnHeights.map((_, idx) => cardWidth * idx + leftMargin)

  childrenKeys.forEach((childKey) => {
    const childCache = childrenCache[childKey]
    // only thing we really care about here is height?
    const {height, width} = childCache.el.getBoundingClientRect()
    const top = Math.min(...currentColumnHeights)
    const shortestColumnIdx = currentColumnHeights.indexOf(top)
    const left = parentCache.columnLefts[shortestColumnIdx]
    childCache.boundingBox = {
      height,
      width,
      top,
      left
    }
    childCache.el.style.transform = `translate(${left}px, ${top}px)`
    currentColumnHeights[shortestColumnIdx] += height
  })
}

export default initializeGrid
