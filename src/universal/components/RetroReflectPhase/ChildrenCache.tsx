import {BBox, Dims, Point} from 'types/animations'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import getTransform from 'universal/components/RetroReflectPhase/getTransform'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import setElementBBox from 'universal/components/RetroReflectPhase/setElementBBox'
import {DECELERATE, STANDARD_CURVE} from 'universal/styles/animation'
import {
  ITEM_DURATION,
  MIN_VAR_ITEM_DELAY,
  MOVE_DELAY,
  MOVE_DURATION
} from 'universal/utils/multiplayerMasonry/masonryConstants'

interface CachedChild {
  key: string
  el: HTMLElement
  dims: Dims
  point?: Point
}

class ChildrenCache {
  cache: Array<CachedChild> = []
  childPadding: number = 0
  childWidth: number = 0
  gridPadding: number = 0
  maxWidth: number = 0
  maxHeight: number = 0

  private get (key) {
    return this.cache.find((cachedChild) => cachedChild.key === key)
  }

  private getGridTuples () {
    const fullColumnWidth = this.childWidth + this.childPadding
    const maxCols = Math.floor(this.maxWidth / fullColumnWidth)
    let bestPerimeter = 1e6
    let result = {height: 0, width: 0, children: [] as Array<Point>}
    for (let ii = 1; ii < maxCols; ii++) {
      const proposedChildren = [] as Array<Point>
      const currentColumnHeights = new Array(ii).fill(this.gridPadding)
      const modalColumnLefts = currentColumnHeights.map(
        (_, idx) => fullColumnWidth * idx + this.gridPadding
      )
      this.cache.forEach((cachedChild) => {
        const {
          dims: {height}
        } = cachedChild
        const shortestColumnTop = Math.min(...currentColumnHeights)
        const shortestColumnIdx = currentColumnHeights.indexOf(shortestColumnTop)
        const left = modalColumnLefts[shortestColumnIdx]
        proposedChildren.push({left, top: shortestColumnTop})
        currentColumnHeights[shortestColumnIdx] = shortestColumnTop + height + this.childPadding
      })
      const gridHeight = Math.max(...currentColumnHeights) - this.childPadding + this.gridPadding
      const gridWidth = ii * fullColumnWidth - this.childPadding + 2 * this.gridPadding
      const perimeter = 2 * gridHeight + 2 * gridWidth

      if (
        perimeter < bestPerimeter ||
        // 1 more column makes it fit better
        (gridHeight >= this.maxHeight && gridWidth + fullColumnWidth <= this.maxWidth)
      ) {
        bestPerimeter = perimeter
        result = {
          height: Math.min(gridHeight, this.maxHeight),
          width: gridWidth,
          children: proposedChildren
        }
      } else {
        break
      }
    }
    return result
  }

  updateChildren () {
    let childrenToAnimate = 0
    const {children, height, width} = this.getGridTuples()
    children.forEach((last, idx) => {
      const {point, el} = this.cache[idx]
      if (!point || (point.left === last.left && point.top === last.top)) return
      childrenToAnimate++
      const {style: elStyle} = el
      setElementBBox(el, last)
      elStyle.transform = getTransform(point, last)
      elStyle.transition = ''
      const delay = MOVE_DELAY + MIN_VAR_ITEM_DELAY * childrenToAnimate
      requestDoubleAnimationFrame(() => {
        elStyle.transition = `transform ${MOVE_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
        elStyle.transform = null
      })
      point.left = last.left
      point.top = last.top
    })
    return {height, width}
  }

  setEl (key: string, el: HTMLElement) {
    const cachedChild = this.get(key)
    if (!cachedChild) {
      const cachedDims = getBBox(el)
      if (cachedDims) {
        const {height, width} = cachedDims
        this.cache.push({el, key, dims: {height, width}})
      }
    }
  }

  setGrid (
    maxWidth: number,
    maxHeight: number,
    childPadding: number,
    childWidth: number,
    gridPadding: number
  ) {
    this.childPadding = childPadding
    this.childWidth = childWidth
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.gridPadding = gridPadding
    const {children, height, width} = this.getGridTuples()
    children.forEach(({left, top}, idx) => {
      this.cache[idx].point = {left, top}
    })
    return {height, width}
  }

  animateIn (first: BBox, parent: BBox) {
    this.cache.forEach((cachedChild) => {
      const {
        point,
        el: {style}
      } = cachedChild
      if (!point) return

      const dX = first.left - point.left - parent.left
      const dY = first.top - point.top - parent.top
      style.position = 'absolute'
      style.top = `${point.top}px`
      style.left = `${point.left}px`
      style.transform = `translate(${dX}px,${dY}px)`
      style.transition = 'transform 0ms'
    })

    requestAnimationFrame(() => {
      this.cache.forEach((cachedChild) => {
        const {
          el: {style}
        } = cachedChild
        style.transition = `transform ${ITEM_DURATION}ms ${DECELERATE}`
        style.transform = null
      })
    })
  }

  animateOut (last: BBox, parent: BBox) {
    this.cache.forEach((cachedChild) => {
      const {
        point,
        el: {style}
      } = cachedChild
      if (!point) return
      const dX = last.left - point.left - parent.left
      const dY = last.top - point.top - parent.top
      style.position = 'absolute'
      style.top = `${last.top - parent.top}px`
      style.left = `${last.left - parent.left}px`
      style.transform = `translate(${-dX}px,${-dY}px)`
      style.transition = ''
    })

    requestAnimationFrame(() => {
      this.cache.forEach((cachedChild) => {
        const {
          el: {style}
        } = cachedChild
        style.transition = `transform ${ITEM_DURATION}ms ${DECELERATE}`
        style.transform = null
      })
    })
  }

  maybeResize = (key: string) => {
    const cachedChild = this.get(key)
    if (!cachedChild) return undefined
    const {dims, el} = cachedChild
    const elBBox = getBBox(el)
    if (!elBBox || dims.height === elBBox.height) return undefined
    dims.height = elBBox.height
    return this.updateChildren()
  }

  removeKeys (keys: Array<string>) {
    keys.forEach((key) => {
      const cachedChild = this.get(key)
      if (!cachedChild) return
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
