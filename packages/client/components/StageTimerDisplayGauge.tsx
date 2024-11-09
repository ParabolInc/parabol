import styled from '@emotion/styled'
import endTimerSound from '../../../static/sounds/tic-tac.mp3'
import useBreakpoint from '../hooks/useBreakpoint'
import useRefreshInterval from '../hooks/useRefreshInterval'
import useSoundEffect from '../hooks/useSoundEffect'
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

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const timeLeft = endTime && countdown(endTime)

  const soundRef = useSoundEffect({endTime})

  const countdownTimerLabel = timeLeft || 'Time’s Up!'
  return (
    <>
      <Gauge isDesktop={isDesktop} isTimeUp={!timeLeft}>
        {countdownTimerLabel}
      </Gauge>
      <audio ref={soundRef} aria-hidden className='hidden' autoPlay={false}>
        <source src={endTimerSound} type='audio/mp3' />
      </audio>
    </>
  )
}

export default StageTimerDisplayGauge
