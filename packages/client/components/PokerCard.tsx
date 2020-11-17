import styled from '@emotion/styled'
import React, {RefObject, useEffect, useRef} from 'react'
import usePokerZIndexOverride from '../hooks/usePokerZIndexOverride'
import logoMarkWhite from '../styles/theme/images/brand/mark-white.svg'
import {BezierCurve, PokerCards} from '../types/constEnums'
import getColorLuminance from '../utils/getColorLuminance'

const COLLAPSE_DUR = 1000
const EXPAND_DUR = 100
interface CardBaseProps {
  color: string,
  isCollapsed: boolean,
  isSelected: boolean,
  radius: number
  rotation: number
  yOffset: number

}

const getRotation = (isSelected: boolean, isCollapsed: boolean, radius: number, rotation: number, yOffset: number) => {
  // TODO fix left offset
  const leftEdge = 500
  if (isCollapsed) return `translate(${leftEdge}px, -${PokerCards.HEIGHT}px)`
  const radians = (rotation * Math.PI) / 180
  const x = radius * Math.sin(radians)
  const y = -radius * Math.cos(radians) + yOffset
  const selectedOffset = isSelected ? - 48 : 0
  return `translate(${x}px, ${y + selectedOffset}px)rotate(${rotation}deg)`
}

const CardBase = styled('div')<CardBaseProps>(({color, isCollapsed, isSelected, radius, rotation, yOffset}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${getColorLuminance(color, -.12)} 100%)`,
  borderRadius: 6,
  cursor: 'pointer',
  display: 'flex',
  height: PokerCards.HEIGHT,
  justifyContent: 'center',
  position: 'absolute',
  transform: getRotation(isSelected, isCollapsed, radius, rotation, yOffset),
  transition: `transform ${isCollapsed ? COLLAPSE_DUR : EXPAND_DUR}ms ${BezierCurve.DECELERATE}`,
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
  radius: number
  rotation: number
  totalCards: number
  yOffset: number
}


const PokerCard = (props: Props) => {
  const {card, isCollapsed, yOffset, isSelected, onClick, onMouseEnter, onMouseLeave, radius, rotation} = props
  const {color, label} = card
  const wasCollapsedRef = useRef(isCollapsed)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMoving = wasCollapsedRef.current !== isCollapsed
  const isExpanding = isMoving && !isCollapsed

  useEffect(() => {
    wasCollapsedRef.current = isCollapsed
  }, [isCollapsed])
  const isTop = isSelected && isMoving
  usePokerZIndexOverride(isTop, cardRef, isExpanding, COLLAPSE_DUR, EXPAND_DUR)
  return (
    <CardBase ref={cardRef} yOffset={yOffset} color={color} isCollapsed={isCollapsed} isSelected={isSelected} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} radius={radius} rotation={rotation}>
      <UpperLeftCardValue>{label}</UpperLeftCardValue>
      <Logo src={logoMarkWhite} />
    </CardBase>
  )
}

export default PokerCard
