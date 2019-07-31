import React from 'react'
import styled from '@emotion/styled'
import {countdown} from '../../utils/date/relativeDate'
import {PALETTE} from '../../styles/paletteV2'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {buttonRaisedShadow} from '../../styles/elevation'
import {DECELERATE, fadeIn} from '../../styles/animation'

interface Props {
  endTime: string
}

const Gauge = styled('div')<{isTimeUp: boolean}>(({isTimeUp}) => ({
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  color: isTimeUp ? PALETTE.TEXT_MAIN : '#fff',
  background: isTimeUp ? PALETTE.BACKGROUND_YELLOW : PALETTE.BACKGROUND_GREEN,
  boxShadow: buttonRaisedShadow,
  borderRadius: 2,
  fontWeight: 600,
  minWidth: 112,
  padding: 8,
  textAlign: 'center',
  transition: `background 1s ${DECELERATE}`,
  userSelect: 'none',
  zIndex: 600 // MD snackbar elevation * 100 to leave room for conflicts
}))

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const timeLeft = endTime && countdown(endTime)
  const fromNow = timeLeft || 'Time’s Up!'
  return <Gauge isTimeUp={!timeLeft}>{fromNow}</Gauge>
}

export default StageTimerDisplayGauge
