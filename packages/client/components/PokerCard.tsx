import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import usePokerZIndexOverride from '../hooks/usePokerZIndexOverride'
import logoMarkWhite from '../styles/theme/images/brand/mark-white.svg'
import {BezierCurve, Breakpoint, PokerCards} from '../types/constEnums'
import getPokerCardBackground from '../utils/getPokerCardBackground'
import {PokerCard_scaleValue} from '../__generated__/PokerCard_scaleValue.graphql'
const COLLAPSE_DUR = 1000
const EXPAND_DUR = 100
interface CardBaseProps {
  color: string,
  isDesktop: boolean,
  isCollapsed: boolean,
  isSelected: boolean,
  rotation: number
  yOffset: number

}

const getRotation = (isSelected: boolean, isCollapsed: boolean, rotation: number, yOffset: number) => {
  // TODO fix left offset
  const leftEdge = 500
  if (isCollapsed) return `translate(${leftEdge}px, -${PokerCards.HEIGHT}px)`
  const radians = (rotation * Math.PI) / 180
  const x = PokerCards.RADIUS * Math.sin(radians)
  const y = -PokerCards.RADIUS * Math.cos(radians) + yOffset
  const selectedOffset = isSelected ? - 48 : 0
  return `translate(${x}px, ${y + selectedOffset}px)rotate(${rotation}deg)`
}

const CardBase = styled('div')<CardBaseProps>(({color, isCollapsed, isDesktop, isSelected, rotation, yOffset}) => {
  const transform = getRotation(isSelected, isCollapsed, rotation, yOffset)
  const hoverTransform = `${transform} translateY(-8px)`
  return ({
    background: getPokerCardBackground(color),
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    height: PokerCards.HEIGHT,
    justifyContent: 'center',
    position: 'absolute',
    transform,
    transition: `transform ${isCollapsed ? COLLAPSE_DUR : EXPAND_DUR}ms ${BezierCurve.DECELERATE}`,
    userSelect: 'none',
    width: PokerCards.WIDTH,
    zIndex: isSelected && isCollapsed ? 1 : undefined,
    '&:hover': {
      transform: isCollapsed ? undefined : isDesktop ? hoverTransform : undefined
    }
  })
})

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

const Pass = styled('img')({
  display: 'block',
  height: 18,
  marginTop: 4,
  width: 18
})

interface Props {
  scaleValue: PokerCard_scaleValue
  deckRef: RefObject<HTMLDivElement>
  idx: number
  isCollapsed: boolean
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  rotation: number
  totalCards: number
  yOffset: number
}


const PokerCard = (props: Props) => {
  const {scaleValue, isCollapsed, yOffset, isSelected, onClick, onMouseEnter, onMouseLeave, rotation} = props
  const {color, label} = scaleValue
  const wasCollapsedRef = useRef(isCollapsed)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMoving = wasCollapsedRef.current !== isCollapsed
  const isExpanding = isMoving && !isCollapsed
  useEffect(() => {
    wasCollapsedRef.current = isCollapsed
  }, [isCollapsed])
  const isTop = isSelected && isMoving
  usePokerZIndexOverride(isTop, cardRef, isExpanding, COLLAPSE_DUR, EXPAND_DUR)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <CardBase
      ref={cardRef}
      yOffset={yOffset}
      color={color}
      isDesktop={isDesktop}
      isCollapsed={isCollapsed}
      isSelected={isSelected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      rotation={rotation}
    >
      <UpperLeftCardValue>
        {label === PokerCards.PASS_CARD ? <Pass src={PassSVG} /> : label}
      </UpperLeftCardValue>
      <Logo src={logoMarkWhite} />
    </CardBase>
  )
}

export default createFragmentContainer(
  PokerCard,
  {
    scaleValue: graphql`
    fragment PokerCard_scaleValue on TemplateScaleValue {
      color
      label
    }`
  }
)
