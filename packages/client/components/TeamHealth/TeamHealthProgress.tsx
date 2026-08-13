import {cn} from '../../ui/cn'

interface Props {
  // number of members who have submitted at least one response
  respondentCount: number
  // total members expected to respond (owner excluded unless they opted in)
  total: number
  className?: string
}

// anonymous progress: colored dots for how many teammates have voted out of the total. The dots
// are deliberately generic (not member avatars) so a response can never be attributed to a person
const DOT_COLORS = ['bg-grape-500', 'bg-jade-500', 'bg-sky-500', 'bg-gold-500', 'bg-tomato-500']

const TeamHealthProgress = (props: Props) => {
  const {respondentCount, total, className} = props
  const dotCount = Math.max(total, respondentCount)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='-space-x-2 flex'>
        {Array.from({length: dotCount}).map((_, idx) => {
          const isFilled = idx < respondentCount
          return (
            <div
              key={idx}
              className={cn(
                // the ring reads as a gap between overlapping dots, so it tracks the card behind them
                'h-8 w-8 rounded-full border-2 border-surface-card',
                isFilled ? DOT_COLORS[idx % DOT_COLORS.length] : 'bg-surface-well'
              )}
            />
          )
        })}
      </div>
      <div className='font-semibold text-fg-secondary'>
        {respondentCount} of {total} teammates voted
      </div>
    </div>
  )
}

export default TeamHealthProgress
