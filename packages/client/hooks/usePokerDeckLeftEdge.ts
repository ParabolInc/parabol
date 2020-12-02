import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeftEdge = (estimateAreaRef: RefObject<HTMLDivElement>) => {
  const [left, setLeft] = useState(0)
  const adjustLeft = () => {
    const phaseBBox = estimateAreaRef.current?.getBoundingClientRect()
    const width = phaseBBox?.width || 500
    setLeft(Math.min(width / 2, 500))
  }
  useLayoutEffect(adjustLeft, [estimateAreaRef])
  useResizeObserver(adjustLeft, estimateAreaRef)
  return left
}

export default usePokerDeckLeftEdge
