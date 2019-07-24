import {REFLECTION_WIDTH} from './masonryConstants'
import {MasonryChildrenCache} from '../../components/PhaseItemMasonry'

const removeColumn = (childrenCache: MasonryChildrenCache, columnLeft: number) => {
  Object.keys(childrenCache).forEach((childKey) => {
    const {boundingBox, el} = childrenCache[childKey]
    if (boundingBox && boundingBox.left > columnLeft) {
      boundingBox.left -= REFLECTION_WIDTH
      el!.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
    }
  })
}

const removeChildCache = (childrenCache: MasonryChildrenCache, childCacheId: string) => {
  const {boundingBox} = childrenCache[childCacheId]
  if (!boundingBox) return null
  const {left} = boundingBox
  delete childrenCache[childCacheId]
  // see if the entire column is gone
  const childrenKeys = Object.keys(childrenCache)
  const colExists = childrenKeys.some((key) => {
    const bb = childrenCache[key].boundingBox
    return bb && bb.left === left
  })
  if (!colExists) {
    removeColumn(childrenCache, left)
    return true
  }
  return false
}

const updateColumnHeight = (childrenCache: MasonryChildrenCache, childCacheId: string) => {
  const resizedChildCache = childrenCache[childCacheId]
  if (!resizedChildCache) return
  const {el: resizedEl, boundingBox: resizedBox} = resizedChildCache
  if (!resizedEl || !resizedBox) return
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
    if (boundingBox && boundingBox.left === resizedBox.left && boundingBox.top > resizedBox.top) {
      boundingBox.top += deltaHeight
      el!.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
    }
  })
}

export default updateColumnHeight
