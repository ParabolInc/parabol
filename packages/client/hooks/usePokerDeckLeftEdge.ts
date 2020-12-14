import {RefObject, useEffect, useLayoutEffect, useState} from 'react'
import {PokerCards} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeftEdge = (estimateAreaRef: RefObject<HTMLDivElement>, isVoting: boolean) => {
  const [leftEdge, setLeft] = useState(0)
  const adjustLeft = () => {
    const el = estimateAreaRef.current
    if (!el) return
    const {clientWidth} = el
    setLeft(clientWidth / 2 - (PokerCards.WIDTH / 4))
  }
  useLayoutEffect(adjustLeft, [estimateAreaRef])
  useResizeObserver(adjustLeft, estimateAreaRef)
  const [showTransition, setShowTransition] = useState(true)
  useEffect(() => {
    const show = !(leftEdge === 0 && !isVoting)
    setShowTransition(show)
  }, [leftEdge])
  // showTransition is to prevent the collapsed deck from moving from center to right edge on refresh
  return [leftEdge, showTransition] as const
}

export default usePokerDeckLeftEdge
