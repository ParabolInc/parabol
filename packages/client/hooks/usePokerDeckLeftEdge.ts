import {RefObject, useLayoutEffect, useState} from 'react'
import {PokerCards} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeftEdge = (estimateAreaRef: RefObject<HTMLDivElement>) => {
  const [left, setLeft] = useState(0)
  const adjustLeft = () => {
    const el = estimateAreaRef.current
    if (!el) return
    const {clientWidth} = el
    setLeft(clientWidth / 2 - (PokerCards.WIDTH / 4))
  }
  useLayoutEffect(adjustLeft, [estimateAreaRef])
  useResizeObserver(adjustLeft, estimateAreaRef)
  return left
}

export default usePokerDeckLeftEdge
