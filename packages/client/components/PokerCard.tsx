import graphql from 'babel-plugin-relay/macro'
import {type CSSProperties, type RefObject, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import type {PokerCard_scaleValue$key} from '../__generated__/PokerCard_scaleValue.graphql'
import usePokerZIndexOverride from '../hooks/usePokerZIndexOverride'
import logoMarkWhite from '../styles/theme/images/brand/mark-white.svg'
import {BezierCurve, Breakpoint, PokerCards} from '../types/constEnums'
import {cn} from '../ui/cn'
import getPokerCardBackground from '../utils/getPokerCardBackground'

const COLLAPSE_DUR = 700
const EXPAND_DUR = 300

const getRotation = (
  isSelected: boolean,
  isCollapsed: boolean,
  leftEdge: number,
  radius: number,
  rotation: number,
  yOffset: number
) => {
  if (isCollapsed) return `translate(${leftEdge}px, -${PokerCards.HEIGHT}px)`
  const radians = (rotation * Math.PI) / 180
  const x = radius * Math.sin(radians)
  const y = -radius * Math.cos(radians) + yOffset
  const selectedOffset = isSelected ? -48 : 0
  return `translate(${x}px, ${y + selectedOffset}px)rotate(${rotation}deg)`
}

const cardValueClassName =
  'absolute font-semibold text-[20px] text-white [text-shadow:0px_1px_1px_rgba(0,0,0,0.05)]'

interface Props {
  scaleValue: PokerCard_scaleValue$key
  deckRef: RefObject<HTMLDivElement>
  idx: number
  isCollapsed: boolean
  isSelected: boolean
  leftEdge: number
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  radius: number
  rotation: number
  showTransition: boolean
  totalCards: number
  yOffset: number
}

const PokerCard = (props: Props) => {
  const {
    scaleValue: scaleValueRef,
    showTransition,
    isCollapsed,
    yOffset,
    isSelected,
    leftEdge,
    onClick,
    onMouseEnter,
    onMouseLeave,
    rotation,
    radius
  } = props
  const scaleValue = useFragment(
    graphql`
      fragment PokerCard_scaleValue on TemplateScaleValue {
        color
        label
      }
    `,
    scaleValueRef
  )
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
  const cornerValue =
    label === PokerCards.PASS_CARD ? (
      <img className='mt-1 block h-[18px] w-[18px]' src={PassSVG} />
    ) : (
      label
    )
  const transform = getRotation(isSelected, isCollapsed, leftEdge, radius, rotation, yOffset)
  const hoverTransform = `${transform} translateY(-8px)`
  const canHover = !isCollapsed && isDesktop
  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute flex h-[175px] w-[125px] cursor-pointer select-none justify-center rounded-md [transform:var(--poker-card-transform)]',
        canHover && 'hover:[transform:var(--poker-card-hover-transform)]',
        isSelected && isCollapsed && 'z-[1]'
      )}
      style={
        {
          background: getPokerCardBackground(color),
          transition: showTransition
            ? `transform ${isCollapsed ? COLLAPSE_DUR : EXPAND_DUR}ms ${BezierCurve.DECELERATE}`
            : undefined,
          '--poker-card-transform': transform,
          '--poker-card-hover-transform': hoverTransform
        } as CSSProperties
      }
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={cn(cardValueClassName, 'top-1 left-2')}>{cornerValue}</div>
      <div className={cn(cardValueClassName, 'right-2 bottom-1')}>{cornerValue}</div>
      <img className='min-w-[64px] max-w-[96px] opacity-50' src={logoMarkWhite} draggable={false} />
    </div>
  )
}

export default PokerCard
