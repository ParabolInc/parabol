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
  // mean of the 1-5 Likert answers, on the scale the team answered on. Null if nobody scored it
  meanScore: number | null
  distribution: number[]
  respondentCount: number
  responseCount: number
  orderedCategoryIds: ReadonlyArray<string>
}

const TeamHealthResultCard = (props: Props) => {
  const {
    categoryId,
    categoryName,
    question,
    meanScore,
    distribution,
    respondentCount,
    responseCount,
    orderedCategoryIds
  } = props

  return (
    <div className='flex flex-col rounded-2xl bg-surface-card p-5 shadow-card'>
      <span
        className={cn(
          'inline-flex h-7 items-center self-start whitespace-nowrap rounded-full px-2.5 font-semibold text-sm',
          getTeamHealthCategoryColor(categoryId, orderedCategoryIds)
        )}
      >
        {categoryName}
      </span>
      {/* the chart sits at a fixed offset on every card so the distributions line up across the
          row and can be read as one sweep. Anything whose height varies with content goes below it */}
      <div className='mt-4'>
        <TeamHealthDistributionChart distribution={distribution} />
      </div>
      <div className='mt-3 flex items-baseline gap-1'>
        <span className='font-bold text-2xl text-fg-primary'>
          {meanScore === null ? '—' : meanScore.toFixed(1)}
        </span>
        {meanScore !== null && <span className='text-fg-muted text-sm'>/ 5</span>}
      </div>
      <p className='mt-2 line-clamp-3 text-fg-secondary text-sm' title={question}>
        {question}
      </p>
      <div className='mt-2 text-fg-muted text-xs'>
        {respondentCount} {plural(respondentCount, 'respondent')} · {responseCount}{' '}
        {plural(responseCount, 'answer')}
      </div>
    </div>
  )
}

export default TeamHealthResultCard
