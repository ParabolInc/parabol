import {ArrowDownward, ArrowUpward, HorizontalRule} from '~/ui/icons'
import {cn} from '../../ui/cn'

interface Props {
  // this cycle's average 1-5 Likert score, null if nobody answered
  score: number | null | undefined
  // the same category's score last cycle, null if the team has never scored it before
  previousScore: number | null | undefined
  className?: string
}

// the arrow carries the direction so the trend still reads without color
const TeamHealthScoreDelta = (props: Props) => {
  const {score, previousScore, className} = props
  if (score === null || score === undefined) {
    return <span className={cn('font-semibold text-fg-muted text-xs', className)}>No answers</span>
  }
  if (previousScore === null || previousScore === undefined) {
    return <span className={cn('font-semibold text-fg-muted text-xs', className)}>New</span>
  }
  const delta = score - previousScore
  const Icon = delta > 0 ? ArrowUpward : delta < 0 ? ArrowDownward : HorizontalRule
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 font-semibold text-xs',
        delta > 0
          ? 'text-jade-600 dark:text-jade-300'
          : delta < 0
            ? 'text-tomato-600 dark:text-tomato-300'
            : 'text-fg-muted',
        className
      )}
    >
      <Icon className='size-3.5' />
      {Math.abs(delta).toFixed(1)}
    </span>
  )
}

export default TeamHealthScoreDelta
