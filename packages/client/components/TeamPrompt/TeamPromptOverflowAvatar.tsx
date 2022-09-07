import styled from '@emotion/styled'
import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {TransitionStatus} from '~/hooks/useTransition'
import useResizeFontForElement from '../../hooks/useResizeFontForElement'
import {BezierCurve} from '../../types/constEnums'

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
}>(({status, isAnimated, width, borderColor = '#fff'}) => ({
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  border: `2px solid ${borderColor}`,
  borderRadius: '50%',
  display: 'flex',
  height: width,
  justifyContent: 'center',
  color: '#fff',
  fontSize: 12,
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
  width
}))

interface Props {
  offset: number
  isAnimated: boolean
  status: TransitionStatus
  onTransitionEnd: () => void
  overflowCount: number
  width: number
  borderColor?: string
}

const TeamPromptOverflowAvatar = (props: Props) => {
  const {overflowCount, offset, status, onTransitionEnd, isAnimated, width, borderColor} = props

  const {t} = useTranslation()

  const ref = useRef<HTMLDivElement>(null)
  const label = overflowCount >= 99 ? 99 : overflowCount
  useResizeFontForElement<HTMLDivElement>(ref, label, 11, 12, 4)
  return (
    <Wrapper offset={offset}>
      <OverflowCount
        width={width}
        ref={ref}
        status={status}
        onTransitionEnd={onTransitionEnd}
        isAnimated={isAnimated}
        borderColor={borderColor}
      >
        {t('TeamPromptOverflowAvatar.')}
        {label}
      </OverflowCount>
    </Wrapper>
  )
}

export default TeamPromptOverflowAvatar
