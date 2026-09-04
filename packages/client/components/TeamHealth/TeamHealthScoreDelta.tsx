import {ArrowDownward, ArrowUpward} from '~/ui/icons'
import {cn} from '../../ui/cn'

interface Props {
  // change in the 1-5 mean since the last cycle that scored this category. Null on a team's first
  // cycle, when there is nothing to compare against
  delta: number | null | undefined
  className?: string
}

// Every built-in question is positively phrased, so a rising score is always the better direction.
// The arrow and the signed number carry that on their own — the color only reinforces it.
const TeamHealthScoreDelta = (props: Props) => {
  const {delta, className} = props
  if (delta === null || delta === undefined) {
    return null
  }
  // a mean shifting by less than a tenth of a Likert point is one person nudging one answer, which
  // is not a movement worth drawing an arrow for
  const rounded = Number(delta.toFixed(1))
  if (rounded === 0) {
    return (
      <span
        className={cn('inline-flex text-fg-muted text-xs', className)}
        title='Unchanged since the last cycle that asked about this category'
      >
        =
      </span>
    )
  }
  const isUp = rounded > 0
  const Arrow = isUp ? ArrowUpward : ArrowDownward
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-semibold text-xs',
        isUp ? 'text-jade-600 dark:text-jade-300' : 'text-tomato-600 dark:text-tomato-300',
        className
      )}
      title={`${isUp ? 'Up' : 'Down'} ${Math.abs(rounded).toFixed(1)} since the last cycle that asked about this category`}
    >
      <Arrow className='size-3.5' />
      {isUp ? `+${rounded.toFixed(1)}` : rounded.toFixed(1)}
    </span>
  )
}

export default TeamHealthScoreDelta
