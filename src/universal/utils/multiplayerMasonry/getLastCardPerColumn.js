const getLastCardPerColumn = (childrenCache, columnLefts) => {
  const lastCardPerColumn = columnLefts.reduce((obj, left) => {
    obj[left] = null
    return obj
  }, {})
  const childrenKeys = Object.keys(childrenCache)
  childrenKeys.forEach((childKey) => {
    const childCache = childrenCache[childKey]
    if (!childCache || !childCache.boundingBox) {
      // this could be called by something that wants to create the bbox
      return
    }
    const {
      boundingBox: {left, top}
    } = childCache
    if (!lastCardPerColumn[left] || lastCardPerColumn[left].boundingBox.top < top) {
      lastCardPerColumn[left] = childCache
    }
  })
  return lastCardPerColumn
}

export default getLastCardPerColumn
