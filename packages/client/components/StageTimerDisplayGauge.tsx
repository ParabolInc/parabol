import endTimerSound from '../../../static/sounds/tic-tac.mp3'
import useBreakpoint from '../hooks/useBreakpoint'
import useRefreshInterval from '../hooks/useRefreshInterval'
import useSoundEffect from '../hooks/useSoundEffect'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'
import {countdown} from '../utils/date/relativeDate'

interface Props {
  endTime: string
}

const StageTimerDisplayGauge = (props: Props) => {
  const {endTime} = props
  useRefreshInterval(1000)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const timeLeft = endTime && countdown(endTime)

  const soundRef = useSoundEffect({endTime})

  const countdownTimerLabel = timeLeft || 'Time’s Up!'
  return (
    <>
      <div
        className={cn(
          'flex h-7 min-w-[100px] animate-[fade-in_300ms_cubic-bezier(0,0,.2,1)] select-none items-center justify-center rounded-[4px] px-2 font-semibold tabular-nums leading-7 transition-[background] duration-1000 ease-[cubic-bezier(0,0,.2,1)]',
          timeLeft
            ? 'bg-jade-400 text-[16px] text-white'
            : 'bg-gold-300 text-[14px] text-slate-700',
          isDesktop ? 'mb-4' : 'mb-2'
        )}
      >
        {countdownTimerLabel}
      </div>
      <audio ref={soundRef} aria-hidden className='hidden' autoPlay={false}>
        <source src={endTimerSound} type='audio/mp3' />
      </audio>
    </>
  )
}

export default StageTimerDisplayGauge
