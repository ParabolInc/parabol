const removeColumn = (childrenCache, columnLeft) => {
  Object.keys(childrenCache).forEach((childKey) => {
    const {boundingBox, el} = childrenCache[childKey]
    if (boundingBox.left > columnLeft) {
      boundingBox.left -= boundingBox.width
      el.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
    }
  })
}
const removeChildCache = (childrenCache, childCacheId) => {
  const {
    boundingBox: {left}
  } = childrenCache[childCacheId]
  console.log('deleting', childCacheId)
  delete childrenCache[childCacheId]
  // see if the entire column is gone
  const childrenKeys = Object.keys(childrenCache)
  const colExists = childrenKeys.some((key) => childrenCache[key].boundingBox.left === left)
  if (!colExists) {
    removeColumn(childrenCache, left)
    return true
  }
  return false
}

const updateColumnHeight = (childrenCache, childCacheId) => {
  const resizedChildCache = childrenCache[childCacheId]
  if (!resizedChildCache) return
  const {el: resizedEl, boundingBox: resizedBox} = resizedChildCache
  const newHeight = resizedEl.getBoundingClientRect().height
  if (newHeight === 0) {
    const isColumnRemoved = removeChildCache(childrenCache, childCacheId)
    if (isColumnRemoved) return
  }
  if (newHeight === resizedBox.height) {
    return
  }

  const deltaHeight = newHeight - resizedBox.height
  resizedBox.height += deltaHeight

  Object.keys(childrenCache).forEach((childKey) => {
    const {boundingBox, el} = childrenCache[childKey]
    const {left, top} = boundingBox
    if (left === resizedBox.left && top > resizedBox.top) {
      boundingBox.top += deltaHeight
      el.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
    }
  })
}

export default updateColumnHeight
