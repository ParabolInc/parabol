import {MonitorHeart} from '@mui/icons-material'
import {cn} from '../../ui/cn'

interface Props {
  // consecutive completed cycles with at least one response, walking back from the last one
  streak: number
  className?: string
}

// bars show up to 5 completed cycles (the most recent one highlighted) plus 1 upcoming slot
const MAX_FILLED_BARS = 5

const CurrentTeamHealthStreak = (props: Props) => {
  const {streak, className} = props
  if (streak <= 0) return null
  const filledCount = Math.min(streak, MAX_FILLED_BARS)
  const totalBars = filledCount + 1

  return (
    <div className={cn('w-full rounded-2xl bg-lilac-100 px-6 py-4 dark:bg-lilac-900', className)}>
      <div className='flex items-center justify-center gap-2 font-semibold text-lilac-700 dark:text-lilac-200'>
        <MonitorHeart fontSize='small' />
        Your team is on a {streak}-cycle streak
      </div>
      <div className='mt-3 flex justify-center gap-1'>
        {Array.from({length: totalBars}).map((_, idx) => {
          const isCurrent = idx === filledCount - 1
          const isFilled = idx < filledCount
          return (
            <div
              key={idx}
              className={cn(
                // the ramp inverts in dark: the panel is lilac-900, so filled bars have to lighten
                'h-1.5 w-8 rounded-full',
                isCurrent
                  ? 'bg-lilac-700 dark:bg-lilac-200'
                  : isFilled
                    ? 'bg-lilac-400'
                    : 'bg-lilac-200 dark:bg-lilac-700'
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CurrentTeamHealthStreak
