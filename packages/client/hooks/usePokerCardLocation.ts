import {useMemo} from 'react'
import {PokerCards} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'



const MAX_SPREAD_DEG = PokerCards.TILT * 2
const usePokerCardLocation = (totalCards: number) => {
  return useMemo(() => {
    const rotationPerCard = MAX_SPREAD_DEG / totalCards
    const initialRotation = (totalCards - 1) / 2 * -rotationPerCard
    const {height} = getRotatedBBox(PokerCards.TILT, PokerCards.WIDTH, PokerCards.HEIGHT)
    const pxBelowFold = height * (1 - PokerCards.MAX_HIDDEN)
    const yOffset = PokerCards.RADIUS * Math.cos((initialRotation * Math.PI) / 180) - pxBelowFold
    return {yOffset, rotationPerCard, initialRotation}
  }, [totalCards])
}

export default usePokerCardLocation
