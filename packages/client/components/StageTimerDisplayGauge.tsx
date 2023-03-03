import styled from '@emotion/styled'
import React, {useEffect, useRef} from 'react'
import sound from '../../../static/sounds/tic-tac.mp3'
import useBreakpoint from '../hooks/useBreakpoint'
import useRefreshInterval from '../hooks/useRefreshInterval'
import {DECELERATE, fadeIn} from '../styles/animation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint} from '../types/constEnums'
import {countdown} from '../utils/date/relativeDate'

interface Props {
  endTime: string
}

const Gauge = styled('div')<{isTimeUp: boolean; isDesktop: boolean}>(({isTimeUp, isDesktop}) => ({
  alignItems: 'flex-end',
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  color: isTimeUp ? PALETTE.SLATE_700 : '#FFFFFF',
  background: isTimeUp ? PALETTE.GOLD_300 : PALETTE.JADE_400,
  borderRadius: 4,
  display: 'flex',
  fontSize: isTimeUp ? 14 : 16,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 600,
  justifyContent: 'center',
  lineHeight: '28px',
  margin: isDesktop ? '0 0 16px' : '0 0 8px',
  minWidth: 100,
  padding: '0 8px',
  transition: `background 1s ${DECELERATE}`,
  userSelect: 'none'
}))

const useSoundEffect = (isTimeUp: boolean) => {
  // avoids playing when navigating to
  // a page when the timer is already up.
  const hasPlayed = useRef(false)

  useEffect(() => {
    hasPlayed.current = isTimeUp
  }, [])

  useEffect(() => {
    if (isTimeUp && !hasPlayed.current) {
      new Audio(sound).play()
      hasPlayed.current = true
    }
    if (!isTimeUp) {
      hasPlayed.current = false
    }
  }, [isTimeUp])
}

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const timeLeft = endTime && countdown(endTime)
  useSoundEffect(!timeLeft)

  const fromNow = timeLeft || 'Time’s Up!'
  return (
    <Gauge isDesktop={isDesktop} isTimeUp={!timeLeft}>
      {fromNow}
    </Gauge>
  )
}

export default StageTimerDisplayGauge
