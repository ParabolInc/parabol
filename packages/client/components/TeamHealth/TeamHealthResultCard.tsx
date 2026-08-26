import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthDistributionChart from './TeamHealthDistributionChart'

interface Props {
  categoryId: string
  categoryName: string
  // the statement the team actually answered this cycle. Rotation picks a different one from the
  // same category next time, which is why the card names both
  question: string
  score: number | null
  distribution: number[]
  respondentCount: number
  responseCount: number
  isDivergent: boolean
  orderedCategoryIds: ReadonlyArray<string>
}

// the same light-100/dark-900 inversion the category tags use, so every pill on this page reads alike
const badgeForScore = (score: number | null) => {
  if (score === null) return {label: 'No responses', className: 'bg-surface-well text-fg-secondary'}
  if (score >= 70)
    return {
      label: 'Strong agreement',
      className: 'bg-jade-100 text-jade-700 dark:bg-jade-900 dark:text-jade-200'
    }
  if (score >= 55)
    return {
      label: 'Aligned',
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200'
    }
  return {
    label: 'Some concern',
    className: 'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-200'
  }
}

const TeamHealthResultCard = (props: Props) => {
  const {
    categoryId,
    categoryName,
    question,
    score,
    distribution,
    respondentCount,
    responseCount,
    isDivergent,
    orderedCategoryIds
  } = props
  const badge = badgeForScore(score)

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-surface-card p-5 shadow-card',
        isDivergent && 'ring-2 ring-grape-500'
      )}
    >
      <span
        className={cn(
          'inline-flex self-start whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-sm',
          getTeamHealthCategoryColor(categoryId, orderedCategoryIds)
        )}
      >
        {categoryName}
      </span>
      <p className='mt-3 font-semibold text-fg-primary text-sm'>{question}</p>
      <div className='mt-4'>
        <TeamHealthDistributionChart distribution={distribution} />
      </div>
      <div className='mt-4 flex items-center justify-between'>
        <span className={cn('rounded-full px-2 py-0.5 font-semibold text-xs', badge.className)}>
          {isDivergent ? 'Biggest divergence' : badge.label}
        </span>
        <div className='flex items-baseline gap-1'>
          <span className='font-bold text-2xl text-fg-primary'>{score ?? '—'}</span>
          {score !== null && <span className='text-fg-muted text-xs'>/ 100</span>}
        </div>
      </div>
      <div className='mt-2 text-fg-muted text-xs'>
        {respondentCount} {plural(respondentCount, 'respondent')} · {responseCount}{' '}
        {plural(responseCount, 'answer')}
      </div>
    </div>
  )
}

export default TeamHealthResultCard
