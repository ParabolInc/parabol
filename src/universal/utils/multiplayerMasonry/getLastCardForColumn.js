const getLastCardForColumn = (childrenCache, columnLeft, excludeId) => {
  return Object.keys(childrenCache)
    .filter((childKey) => childKey !== excludeId)
    .reduce((columnBottom, childKey) => {
      const {
        boundingBox: {left, top, height}
      } = childrenCache[childKey]
      return left === columnLeft && top + height > columnBottom ? top + height : columnBottom
    }, 0)
}

export default getLastCardForColumn
