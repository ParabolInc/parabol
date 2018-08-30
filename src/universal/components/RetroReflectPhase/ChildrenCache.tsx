import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import getStaggerDelay from 'universal/components/RetroReflectPhase/getStaggerDelay'
import getTransform from 'universal/components/RetroReflectPhase/getTransform'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import setElementBBox from 'universal/components/RetroReflectPhase/setElementBBox'
import {STANDARD_CURVE} from 'universal/styles/animation'
import {
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MOVE_DELAY,
  MOVE_DURATION
} from 'universal/utils/multiplayerMasonry/masonryConstants'

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
  childPadding: number
  childWidth: number
  gridPadding: number
  maxWidth: number
  maxHeight: number

  private get(key) {
    return this.cache.find((cachedChild) => cachedChild.key === key)
  }

  private getGridTuples() {
    const fullColumnWidth = this.childWidth + this.childPadding
    const maxCols = Math.floor(this.maxWidth / fullColumnWidth)
    let bestPerimeter = 1e6
    let result = {height: 0, width: 0, children: []}
    for (let ii = 1; ii < maxCols; ii++) {
      const proposedChildren = []
      const currentColumnHeights = new Array(ii).fill(this.gridPadding)
      const modalColumnLefts = currentColumnHeights.map((_, idx) => (fullColumnWidth) * idx + this.gridPadding)
      this.cache.forEach((cachedChild) => {
        const {bbox: {height}} = cachedChild
        const shortestColumnTop = Math.min(...currentColumnHeights)
        const shortestColumnIdx = currentColumnHeights.indexOf(shortestColumnTop)
        const left = modalColumnLefts[shortestColumnIdx]
        proposedChildren.push({left, top: shortestColumnTop})
        currentColumnHeights[shortestColumnIdx] = shortestColumnTop + height + this.childPadding
      })
      const gridHeight = Math.max(...currentColumnHeights) - this.childPadding + 2 * this.gridPadding
      const gridWidth = ii * fullColumnWidth - this.childPadding + 2 * this.gridPadding
      const perimeter = 2 * gridHeight + 2 * gridWidth

      if (perimeter < bestPerimeter ||
        // 1 more column makes it fit better
        (gridHeight >= this.maxHeight && gridWidth + fullColumnWidth <= this.maxWidth)
      ) {
        bestPerimeter = perimeter
        result = {height: Math.min(gridHeight, this.maxHeight), width: gridWidth, children: proposedChildren}
      } else {
        break
      }
    }
    return result
  }

  private updateChildren() {
    let childrenToAnimate = 0
    const {children, height, width} = this.getGridTuples()
    children.forEach((last, idx) => {
      const {bbox, el} = this.cache[idx]
      if (bbox.left === last.left && bbox.top === last.top) return
      childrenToAnimate++
      const {style: elStyle} = el
      setElementBBox(el, last)
      elStyle.transform = getTransform(bbox, last)
      elStyle.transition = null
      const delay = MOVE_DELAY + MIN_VAR_ITEM_DELAY * childrenToAnimate
      requestDoubleAnimationFrame(() => {
        elStyle.transition = `transform ${MOVE_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
        elStyle.transform = null
      })
      bbox.left = last.left
      bbox.top = last.top
    })
    return {height, width}
  }

  setEl(key: string, el: HTMLElement) {
    const cachedChild = this.get(key)
    if (!cachedChild) {
      const {height, width} = getBBox(el)
      this.cache.push({el, key, bbox: {height, width}})
    }
  }

  setGrid(maxWidth: number, maxHeight: number, childPadding: number, childWidth: number, gridPadding: number) {
    this.childPadding = childPadding
    this.childWidth = childWidth
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.gridPadding = gridPadding
    const {children, height, width} = this.getGridTuples()
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
      style.transition = null
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

  maybeResize = (key: string) => {
    const cachedChild = this.get(key)
    if (!cachedChild) return undefined
    const {bbox, el} = cachedChild
    const {height} = getBBox(el)
    if (bbox.height === height) return undefined
    bbox.height = height
    return this.updateChildren()
  }

  removeKeys(keys: Array<string>) {
    keys.forEach((key) => {
      const cachedChild = this.get(key)
      const {el} = cachedChild
      const {style: childStyle} = el
      childStyle.transition = `all 300ms`
      childStyle.transform = `scale(0)`
      childStyle.opacity = '0'
      this.cache = this.cache.filter((cachedChild) => cachedChild.key !== key)
    })
    return this.updateChildren()
  }
}

export default ChildrenCache
