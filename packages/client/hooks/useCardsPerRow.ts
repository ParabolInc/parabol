import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useCardsPerRow = (wrapperRef: RefObject<HTMLDivElement>) => {
  const [cardsPerRow, setCardsPerRow] = useState(0)

  const getCardsPerRow = () => {
    const {current: el} = wrapperRef
    const width = el?.clientWidth || 0
    const cardsPerRow = Math.floor(width / (320 + 16))
    setCardsPerRow(cardsPerRow)
  }

  useLayoutEffect(() => getCardsPerRow(), [wrapperRef.current])
  useResizeObserver(getCardsPerRow, wrapperRef)
  return Math.max(cardsPerRow, 1)
}

export default useCardsPerRow
