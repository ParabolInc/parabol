import React from 'react'
import styled, {keyframes} from 'react-emotion'
import {countdown} from 'universal/utils/relativeDate'
import {PALETTE} from 'universal/styles/paletteV2'
import useRefreshInterval from 'universal/hooks/useRefreshInterval'
import {buttonRaisedShadow} from 'universal/styles/elevation'
import {DECELERATE} from 'universal/styles/animation'

interface Props {
  endTime: string
}

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

const Gauge = styled('div')(({isTimeUp}: {isTimeUp: boolean}) => ({
  animation: `${fadeIn} 300ms ${DECELERATE}`,
  color: isTimeUp ? PALETTE.TEXT.MAIN : '#fff',
  background: isTimeUp ? PALETTE.BACKGROUND.YELLOW : PALETTE.BACKGROUND.GREEN,
  boxShadow: buttonRaisedShadow,
  borderRadius: 2,
  fontWeight: 600,
  minWidth: 112,
  padding: 8,
  textAlign: 'center',
  transition: `background 1s ${DECELERATE}`,
  userSelect: 'none'
}))

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const timeLeft = endTime && countdown(endTime)
  const fromNow = timeLeft || 'Time’s Up!'
  return <Gauge isTimeUp={!timeLeft}>{fromNow}</Gauge>
}

export default StageTimerDisplayGauge
