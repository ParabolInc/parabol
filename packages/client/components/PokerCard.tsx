import styled from '@emotion/styled'
import React, {RefObject, useEffect, useRef} from 'react'
import usePokerZIndexOverride from '../hooks/usePokerZIndexOverride'
import logoMarkWhite from '../styles/theme/images/brand/mark-white.svg'
import {BezierCurve, PokerCards} from '../types/constEnums'
import getBezierTimePercentGivenDistancePercent from '../utils/getBezierTimePercentGivenDistancePercent'
import getColorLuminance from '../utils/getColorLuminance'

const getCollapsedX = () => window.innerWidth - PokerCards.WIDTH - 16
const COLLAPSE_DUR = 1000
const EASE = BezierCurve.DECELERATE

const getYPos = (isSelected: boolean, totalCards: number, idx: number, isCollapsed: boolean) => {
  if (isCollapsed) return 0
  if (isSelected) return -48
  const totalSteps = Math.floor(totalCards / 2)
  // the +1 is to even out the middle 2 cards if the deck is even number of cards
  const stepIdx = idx < totalSteps ? idx : totalSteps - (idx + 1 - totalSteps)
  const STEP_VAL = -4
  return STEP_VAL * stepIdx
}

const getXPos = (idx: number, isCollapsed: boolean, cardRef: RefObject<HTMLDivElement>) => {
  const x = cardRef.current?.getBoundingClientRect().x ?? null
  const STEP_VAL = -PokerCards.OVERLAP
  if (!isCollapsed || x === null) return STEP_VAL * idx
  const delta = getCollapsedX() - x
  return delta + (STEP_VAL * idx)
}

const getShuffleToTopDelay = (cardRef: RefObject<HTMLDivElement>, deckRef: RefObject<HTMLDivElement>, isMoving: boolean, isSelected: boolean, idx: number, totalCards: number) => {
  if (!isMoving || !isSelected || idx === totalCards - 1) return 0
  const deckX = deckRef.current?.getBoundingClientRect().x ?? null
  const cardRefX = cardRef.current?.getBoundingClientRect().x ?? null
  if (deckX === null || cardRefX === null) return 0
  const collapsedX = getCollapsedX()
  const isExpanding = cardRefX === collapsedX
  const distanceToWait = isExpanding ? PokerCards.WIDTH : idx === 0 ? PokerCards.OVERLAP : cardRefX + PokerCards.WIDTH - deckX
  const distaneTheFirstCardMustTravel = collapsedX - deckX
  const distancePercent = (distanceToWait + 48) / distaneTheFirstCardMustTravel
  const timePercent = getBezierTimePercentGivenDistancePercent(distancePercent, EASE)
  return timePercent * COLLAPSE_DUR
}

interface CardBaseProps {
  cardRef: RefObject<HTMLDivElement>,
  color: string,
  delay: number
  idx: number,
  isCollapsed: boolean,
  isSelected: boolean,
  totalCards: number
}

// const getRotation = (totalCards: number, idx: number) => {
//   const totalSteps = Math.floor(totalCards / 2)
//   const stepIdx = idx < totalSteps ? idx : totalSteps - (idx - totalSteps)
//   const values = [2, 5, 9, 14, 20, 27, 35]
//   const slicedVals = values.slice(0, totalSteps).reverse()
//   const val = slicedVals[stepIdx]
//   const res = idx < totalSteps ? -val : val
//   console.log('res', {res, idx, stepIdx})
//   return res
// }
const CardBase = styled('div')<CardBaseProps>(({cardRef, color, idx, isCollapsed, isSelected, totalCards, delay}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${getColorLuminance(color, -.12)} 100%)`,
  borderRadius: 6,
  display: 'flex',
  height: PokerCards.HEIGHT,
  justifyContent: 'center',
  position: 'relative',
  transform: `translate(${getXPos(idx, isCollapsed, cardRef)}px, ${getYPos(isSelected, totalCards, idx, isCollapsed)}px)`,
  transition: `transform ${isCollapsed ? COLLAPSE_DUR : 100}ms ${EASE} ${delay}ms`,
  userSelect: 'none',
  width: PokerCards.WIDTH,
  zIndex: isSelected && isCollapsed ? 1 : undefined
}))

const UpperLeftCardValue = styled('div')({
  color: '#fff',
  textShadow: '0px 1px 1px rgba(0,0,0,0.05)',
  fontSize: 20,
  fontWeight: 600,
  position: 'absolute',
  top: 4,
  left: 8
})

const Logo = styled('img')({
  // set min & max to accomodate custom logos here
  minWidth: 64,
  maxWidth: PokerCards.OVERLAP,
  opacity: 0.5

})
interface Props {
  card: any
  deckRef: RefObject<HTMLDivElement>
  idx: number
  isCollapsed: boolean
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  totalCards: number
}


const PokerCard = (props: Props) => {
  const {card, idx, isCollapsed, isSelected, onClick, totalCards, deckRef, onMouseEnter, onMouseLeave} = props
  const {color, label} = card
  const wasCollapsedRef = useRef(isCollapsed)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMoving = wasCollapsedRef.current !== isCollapsed
  const isExpanding = isMoving && !isCollapsed

  useEffect(() => {
    wasCollapsedRef.current = isCollapsed
  }, [isCollapsed])
  const ref = idx === 0 ? deckRef : cardRef
  const delay = getShuffleToTopDelay(ref, deckRef, isMoving, isSelected, idx, totalCards)
  usePokerZIndexOverride(delay, cardRef, isExpanding, COLLAPSE_DUR)
  return (
    <CardBase ref={cardRef} delay={delay} cardRef={ref} color={color} idx={idx} isCollapsed={isCollapsed} isSelected={isSelected} totalCards={totalCards} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <UpperLeftCardValue>{label}</UpperLeftCardValue>
      <Logo src={logoMarkWhite} />
    </CardBase>
  )
}

export default PokerCard
