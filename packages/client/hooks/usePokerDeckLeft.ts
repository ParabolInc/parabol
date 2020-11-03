
import {RefObject, useLayoutEffect, useState} from 'react'
import {PokerCards} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeft = (deckRef: RefObject<HTMLDivElement>, totalCards: number) => {
  const [left, setLeft] = useState(0)
  const adjustLeft = () => {
    const totalWidth = deckRef.current!.clientWidth
    const deckWidth = PokerCards.WIDTH + (PokerCards.WIDTH - PokerCards.OVERLAP) * (totalCards - 1)
    setLeft((totalWidth - deckWidth) / 2)
  }
  useLayoutEffect(adjustLeft, [])
  useResizeObserver(adjustLeft, deckRef)
  return left
}

export default usePokerDeckLeft
