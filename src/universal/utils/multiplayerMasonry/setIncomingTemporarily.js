import getLastCardPerColumn from 'universal/utils/multiplayerMasonry/getLastCardPerColumn'

const setIncomingTemporarily = (childrenCache, parentCache) => {
  console.log('card not dropped yet! setting el at a temporary location')
  const {
    columnLefts,
    incomingChild: {childId}
  } = parentCache
  const childCache = childrenCache[childId]
  // we don't know where it was dropped yet, but it needs a home! for now, stick it on the shortest column
  const lastCardPerColumn = getLastCardPerColumn(childrenCache, columnLefts)
  const bottoms = columnLefts.map(
    (columnLeft) =>
      lastCardPerColumn[columnLeft]
        ? lastCardPerColumn[columnLeft].boundingBox.top +
          lastCardPerColumn[columnLeft].boundingBox.height
        : 0
  )
  const top = Math.min(...bottoms)
  const left = columnLefts[bottoms.indexOf(top)]
  const {height, width} = childCache.el.getBoundingClientRect()
  childCache.boundingBox = {top, left, width, height}
  // NOTE: we don't update the UI because we know this will change very quickly.
}

export default setIncomingTemporarily
