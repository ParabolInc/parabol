import React from 'react'
import styled from '@emotion/styled'
import {countdown} from '../../utils/date/relativeDate'
import {PALETTE} from '../../styles/paletteV2'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {snackbarShadow} from '../../styles/elevation'
import {DECELERATE, fadeIn} from '../../styles/animation'
import {ZIndex} from '../../types/constEnums'

interface Props {
  endTime: string
}

const Gauge = styled('div')<{isTimeUp: boolean}>(({isTimeUp}) => ({
  alignItems: 'flex-end',
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  color: isTimeUp ? PALETTE.TEXT_MAIN : '#FFFFFF',
  background: isTimeUp ? PALETTE.BACKGROUND_YELLOW : PALETTE.BACKGROUND_GREEN,
  boxShadow: snackbarShadow,
  borderRadius: 2,
  display: 'flex',
  fontWeight: 600,
  justifyContent: 'center',
  minWidth: 112,
  padding: 8,
  transition: `background 1s ${DECELERATE}`,
  userSelect: 'none',
  zIndex: ZIndex.SNACKBAR
}))

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const timeLeft = endTime && countdown(endTime)
  const fromNow = timeLeft || 'Time’s Up!'
  return <Gauge isTimeUp={!timeLeft}>{fromNow}</Gauge>
}

export default StageTimerDisplayGauge
