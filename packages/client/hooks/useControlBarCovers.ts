import {RefObject, useEffect} from 'react'

interface ControlBarCoverable {
  id: string
  el: HTMLDivElement
  left: number
  right: number
  isExpanded: boolean
}

const coverables = {} as {[id: string]: ControlBarCoverable}
const covering = {el: null, left: 0, right: 0} as {
  el: HTMLDivElement | null
  left: number
  right: number
}

const ensureCovering = (coverable: ControlBarCoverable, leftBound: number, rightBound: number) => {
  const willBeExpanded = coverable.left > rightBound || coverable.right < leftBound ? true : false
  const height = willBeExpanded ? '100%' : 'calc(100% - 56px)'
  const {style} = coverable.el
  style.height = height
  coverable.isExpanded = willBeExpanded
  // style.transition = !isAnimated ? `height 100ms ${BezierCurve.DECELERATE}` : ''
}

export const useCoverable = (id: string, ref: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const bbox = el.getBoundingClientRect()
    const {left, right} = bbox
    const oldCoverable = coverables[id]
    const BUFFER = 8
    const coverable = {
      id,
      el,
      left: left - BUFFER,
      right: right + BUFFER,
      isExpanded: oldCoverable?.isExpanded ?? false
    }
    if (covering.el) {
      // if (covering.right === 0) {
      cacheCoveringBBox()
      // }
      ensureCovering(coverable, covering.left, covering.right)
    }
    coverables[id] = coverable
    return () => {
      const oldCoverable = coverables[id]
      ;(oldCoverable as any).el = null
    }
  }, [])
  return coverables[id]?.isExpanded ?? false
}

export const ensureAllCovering = (leftBound: number, rightBound: number) => {
  Object.values(coverables).forEach((coverable) => {
    ensureCovering(coverable, leftBound, rightBound)
  })
}

export const cacheCoveringBBox = () => {
  if (covering.el) {
    const coveringBBox = covering.el.getBoundingClientRect()
    const {left, right} = coveringBBox
    covering.left = left
    covering.right = right
  }
  return covering
}

export const useCovering = (ref: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    covering.el = el
    if (Object.keys(coverables).length) {
      cacheCoveringBBox()
    }
    ensureAllCovering(covering.left, covering.right)
    return () => {
      covering.el = null
    }
  }, [])
}
