
import {RefObject, useLayoutEffect, useState} from 'react'
import {PokerCards} from '../types/constEnums'

const usePokerDeckLeft = (deckRef: RefObject<HTMLDivElement>, totalCards: number) => {
  const [left, setLeft] = useState(0)
  useLayoutEffect(() => {
    const totalWidth = deckRef.current!.clientWidth
    const deckWidth = PokerCards.WIDTH + (PokerCards.WIDTH - PokerCards.OVERLAP) * (totalCards - 1)
    setLeft((totalWidth - deckWidth) / 2)
  }, [])
  return left
}

export default usePokerDeckLeft
