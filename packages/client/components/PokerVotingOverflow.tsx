import styled from '@emotion/styled'
import React, {useRef} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import useResizeFontForElement from '../hooks/useResizeFontForElement'
import {PALETTE} from '../styles/paletteV2'
import {BezierCurve} from '../types/constEnums'

const Wrapper = styled('div')<{idx: number}>(({idx}) => ({
  position: 'absolute',
  transform: `translateX(${idx * 30}px)`,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const OverflowCount = styled('div')<{status?: TransitionStatus}>(({status}) => ({
  alignItems: 'center',
  backgroundColor: PALETTE.BACKGROUND_BLUE_LIGHT,
  border: `2px solid ${PALETTE.BORDER_MATCH_MEETING_COLUMN}`,
  borderRadius: '50%',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  width: 40,
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  opacity: status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED ? 0 : 1,
  overflow: 'hidden',
  transform: status === TransitionStatus.EXITING || status === TransitionStatus.MOUNTED ? 'scale(0)' : 'scale(1)',
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none'
}))

interface Props {
  idx: number
  status: TransitionStatus
  onTransitionEnd: () => void
  overflowCount: number
}

const PokerVotingOverflow = (props: Props) => {
  const {overflowCount, idx, status, onTransitionEnd} = props
  const ref = useRef<HTMLDivElement>(null)
  useResizeFontForElement<HTMLDivElement>(ref, '', 12, 18)
  return (
    <Wrapper idx={idx}>
      <OverflowCount
        ref={ref}
        status={status}
        onTransitionEnd={onTransitionEnd}>{`+${overflowCount}`}</OverflowCount>
    </Wrapper>
  )
}

export default PokerVotingOverflow
