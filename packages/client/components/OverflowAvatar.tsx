import styled from '@emotion/styled'
import React, {useRef} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import useResizeFontForElement from '../hooks/useResizeFontForElement'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve} from '../types/constEnums'

const Wrapper = styled('div')<{offset: number}>(({offset}) => ({
  position: 'absolute',
  transform: `translateX(${offset}px)`,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const OverflowCount = styled('div')<{
  status?: TransitionStatus
  isAnimated: boolean
  width: number
  borderColor?: string
  onClick?: () => void
}>(({status, isAnimated, width, borderColor = '#fff', onClick}) => ({
  alignItems: 'center',
  backgroundColor: PALETTE.SKY_400,
  border: `2px solid ${borderColor}`,
  borderRadius: '50%',
  display: 'flex',
  height: width,
  justifyContent: 'center',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  opacity: !isAnimated
    ? undefined
    : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
    ? 0
    : 1,
  overflow: 'hidden',
  transform: !isAnimated
    ? undefined
    : status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED
    ? 'scale(0)'
    : 'scale(1)',
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  width,
  ...(onClick ? {cursor: 'pointer'} : null)
}))

interface Props {
  offset: number
  isAnimated: boolean
  status: TransitionStatus
  onTransitionEnd: () => void
  overflowCount: number
  onClick?: () => void
  width: number
  borderColor?: string
}

const OverflowAvatar = (props: Props) => {
  const {overflowCount, offset, status, onTransitionEnd, isAnimated, onClick, width, borderColor} =
    props
  const ref = useRef<HTMLDivElement>(null)
  const label = overflowCount >= 99 ? 99 : overflowCount
  useResizeFontForElement<HTMLDivElement>(ref, label, 11, 18, 4)
  return (
    <Wrapper offset={offset}>
      <OverflowCount
        width={width}
        ref={ref}
        status={status}
        onTransitionEnd={onTransitionEnd}
        isAnimated={isAnimated}
        borderColor={borderColor}
        onClick={onClick}
      >
        +{label}
      </OverflowCount>
    </Wrapper>
  )
}

export default OverflowAvatar
