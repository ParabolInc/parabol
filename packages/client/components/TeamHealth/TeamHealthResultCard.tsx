import {Lock} from '~/ui/icons'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import {formatTeamHealthScore} from './formatTeamHealthScore'
import TeamHealthDistributionChart from './TeamHealthDistributionChart'

export const OBSCURE_SPREAD_BELOW = 4
export const OBSCURED_SPREAD_EXPLANATION =
  'With this few answers the shape of the spread is close enough to a list of who said what, so it stays hidden. The average still counts every answer.'

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
  const isObscured = responseCount > 0 && responseCount < OBSCURE_SPREAD_BELOW

  return (
    <div className='flex h-full flex-col rounded-2xl bg-surface-card p-5 shadow-card'>
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
      <div className='relative mt-4'>
        <TeamHealthDistributionChart distribution={distribution} isObscured={isObscured} />
        {isObscured && (
          <div
            className='absolute inset-0 flex items-center justify-center'
            title={OBSCURED_SPREAD_EXPLANATION}
          >
            <span className='flex items-center gap-1 rounded-full bg-surface-raised px-2.5 py-1 font-semibold text-fg-secondary text-xs shadow-card'>
              <Lock className='size-3.5' />
              Spread hidden
            </span>
          </div>
        )}
      </div>
      <div className='mt-3 flex items-baseline gap-1'>
        <span className='font-bold text-2xl text-fg-primary'>
          {meanScore === null ? '—' : formatTeamHealthScore(meanScore)}
        </span>
        {meanScore !== null && <span className='text-fg-muted text-sm'>/ 5</span>}
      </div>
      {/* three lines' worth of room whether or not the question fills it, so the counts below sit
          on the same line across the row */}
      <p className='mt-2 line-clamp-3 min-h-15 text-fg-secondary text-sm' title={question}>
        {question}
      </p>
      <div className='mt-auto pt-2 text-fg-muted text-xs'>
        {respondentCount} {plural(respondentCount, 'respondent')} · {responseCount}{' '}
        {plural(responseCount, 'answer')}
      </div>
    </div>
  )
}

export default TeamHealthResultCard
