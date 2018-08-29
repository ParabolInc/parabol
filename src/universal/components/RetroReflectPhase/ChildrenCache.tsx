import getStaggerDelay from 'universal/components/RetroReflectPhase/getStaggerDelay'
import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'
import {STANDARD_CURVE} from 'universal/styles/animation'
import {ITEM_DURATION, MIN_ITEM_DELAY} from 'universal/utils/multiplayerMasonry/masonryConstants'

interface ChildBBox {
  height: number
  top?: number
  left?: number
  width?: number
}

interface CachedChild {
  key: string
  el: HTMLElement
  bbox: ChildBBox
}

class ChildrenCache {
  cache: Array<CachedChild> = []

  setEl(key: string, el: HTMLElement) {
    const cachedChild = this.cache.find((cachedChild) => cachedChild.key === key)
    if (!cachedChild) {
      const {height, width} = el.getBoundingClientRect()
      this.cache.push({el, key, bbox: {height, width}})
    }
  }

  getGridTuples(maxWidth: number, childPadding: number, childWidth: number) {
    const maxCols = Math.floor(maxWidth / childWidth)
    let bestPerimeter = 1e6
    let result = {height: 0, width: 0, children: []}
    for (let ii = 1; ii < maxCols; ii++) {
      const proposedChildren = []
      const currentColumnHeights = new Array(ii).fill(0)
      const modalColumnLefts = currentColumnHeights.map((_, idx) => childWidth * idx)
      this.cache.forEach((cachedChild) => {
        const {bbox: {height}} = cachedChild
        const shortestColumnTop = Math.min(...currentColumnHeights)
        const shortestColumnIdx = currentColumnHeights.indexOf(shortestColumnTop)
        const left = modalColumnLefts[shortestColumnIdx]
        proposedChildren.push({left, top: shortestColumnTop})
        currentColumnHeights[shortestColumnIdx] = shortestColumnTop + height + childPadding
      })
      const gridHeight = Math.max(...currentColumnHeights) - childPadding
      const gridWidth = ii * childWidth
      const perimeter = 2 * gridHeight + 2 * gridWidth
      if (perimeter < bestPerimeter) {
        bestPerimeter = perimeter
        result = {height: gridHeight, width: gridWidth, children: proposedChildren}
      } else {
        break
      }
    }
    return result
  }

  setGrid(maxWidth: number, childPadding: number, childWidth: number) {
    const {children, height, width} = this.getGridTuples(maxWidth, childPadding, childWidth)
    children.forEach(({left, top}, idx) => {
      const {bbox} = this.cache[idx]
      bbox.left = left
      bbox.top = top
    })
    return {height, width}
  }

  animateIn(first: BBox, parent: BBox) {
    this.cache.forEach((cachedChild) => {
      const {bbox, el: {style}} = cachedChild
      const dX = first.left - bbox.left - parent.left
      const dY = first.top - bbox.top - parent.top
      style.position = 'absolute'
      style.top = `${bbox.top}px`
      style.left = `${bbox.left}px`
      style.transform = `translate(${dX}px,${dY}px)`
      style.transition = 'transform 0ms'
    })

    requestAnimationFrame(() => {
      const staggerDelay = getStaggerDelay(this.cache.length)
      this.cache.forEach((cachedChild, idx) => {
        const {el: {style}} = cachedChild
        const delay = MIN_ITEM_DELAY + staggerDelay * (this.cache.length - idx - 1)
        style.transition = `transform ${ITEM_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
        style.transform = null
      })
    })
  }

  animateOut(last: BBox, parent: BBox) {
    this.cache.forEach((cachedChild) => {
      const {bbox, el: {style}} = cachedChild
      const dX = last.left - bbox.left - parent.left
      const dY = last.top - bbox.top - parent.top
      style.position = 'absolute'
      style.top = `${last.top - parent.top}px`
      style.left = `${last.left - parent.left}px`
      style.transform = `translate(${-dX}px,${-dY}px)`
      style.transition = 'transform 0ms'
    })

    requestAnimationFrame(() => {
      const staggerDelay = getStaggerDelay(this.cache.length)
      this.cache.forEach((cachedChild, idx) => {
        const {el: {style}} = cachedChild
        const delay = MIN_ITEM_DELAY + staggerDelay * idx
        style.transition = `transform ${ITEM_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
        style.transform = null
      })
    })
  }
}

export default ChildrenCache
