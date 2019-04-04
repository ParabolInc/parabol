import {useCallback, useLayoutEffect, useRef, useState} from 'react'
import {BBox} from 'types/animations'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import {getOffset} from 'universal/decorators/withCoordsV2'
import useRefState from 'universal/hooks/useRefState'
import useResizeObserver from 'universal/hooks/useResizeObserver'

export type UseCoordsValue =
  | {top: number; left: number}
  | {top: number; right: number}
  | {bottom: number; right: number}
  | {bottom: number; left: number}

export interface ModalAnchor {
  horizontal: 'left' | 'center' | 'right'
  vertical: 'top' | 'center' | 'bottom'
}

const getNextCoords = (
  targetBBox: BBox,
  originBBox: BBox,
  targetAnchor: ModalAnchor,
  originAnchor: ModalAnchor
) => {
  const {height: modalHeight, width: modalWidth} = targetBBox
  const {height: originHeight, width: originWidth, left: originLeft, top: originTop} = originBBox

  const nextCoords = {} as any

  const originLeftOffset = getOffset(originAnchor.horizontal, originWidth)
  const {scrollX, scrollY, innerHeight} = window
  // Do not use window.innerWidth because that does not account for the scrollbar width
  const pageWidth = document.documentElement.clientWidth
  if (targetAnchor.horizontal !== 'right') {
    const targetLeftOffset = getOffset(targetAnchor.horizontal, modalWidth)
    const left = scrollX + originLeft + originLeftOffset - targetLeftOffset
    const maxLeft = pageWidth - modalWidth + scrollX
    nextCoords.left = Math.min(left, maxLeft)
  } else {
    const right = pageWidth - (originLeft + originLeftOffset) - scrollX
    const maxRight = pageWidth - modalWidth - scrollX
    nextCoords.right = Math.min(right, maxRight)
  }

  if (targetAnchor.vertical !== 'bottom') {
    const originTopOffset = getOffset(originAnchor.vertical, originHeight)
    const targetTopOffset = getOffset(targetAnchor.vertical, modalHeight)
    const top = scrollY + originTop + originTopOffset - targetTopOffset
    const isBelow = top + modalHeight < innerHeight + scrollY
    if (isBelow) {
      nextCoords.top = top
    }
  }
  // if by choice or circumstance, put it above & anchor it from the bottom
  if (nextCoords.top === undefined) {
    const bottom = innerHeight - originTop - scrollY
    const maxBottom = innerHeight - modalHeight + scrollY
    nextCoords.bottom = Math.min(bottom, maxBottom)
  }
  return nextCoords as UseCoordsValue
}

const useCoords = (originAnchor: ModalAnchor, targetAnchor: ModalAnchor) => {
  const [currentTargetRef, setTargetRef] = useState<HTMLDivElement | null>(null)
  const targetRef = useCallback((c) => {
    setTargetRef(c)
  }, [])
  const originRef = useRef<HTMLDivElement>(null)
  const [coordsRef, setCoords] = useRefState<UseCoordsValue>({left: 0, top: 0})
  // const latestCoords = useRef(coords)
  useLayoutEffect(() => {
    if (!currentTargetRef || !originRef.current) return

    // Bounding adjustments mimic native (flip from below to above for Y, but adjust pixel-by-pixel for X)
    const targetBBox = currentTargetRef.getBoundingClientRect()
    const originBBox = originRef.current.getBoundingClientRect()
    const nextCoords = getNextCoords(targetBBox, originBBox, targetAnchor, originAnchor)
    // listen to window resize only if it's anchored on the right or bottom
    setCoords(nextCoords)
    window.addEventListener('resize', resizeWindow, {passive: true})
    return () => {
      window.removeEventListener('resize', resizeWindow)
    }
  }, [currentTargetRef])

  useResizeObserver(currentTargetRef, () => {
    const targetBBox = getBBox(currentTargetRef)!
    const originBBox = getBBox(originRef.current)!
    const nextCoords = getNextCoords(targetBBox, originBBox, targetAnchor, originAnchor)
    setCoords(nextCoords)
  })

  const resizeWindow = () => {
    const coords = coordsRef.current
    if (currentTargetRef && ('right' in coords || 'bottom' in coords)) {
      const targetCoords = currentTargetRef.getBoundingClientRect()
      setCoords({
        left: targetCoords.left,
        top: targetCoords.top
      })
    }
  }
  return {targetRef, originRef, coords: coordsRef.current}
}

export default useCoords
