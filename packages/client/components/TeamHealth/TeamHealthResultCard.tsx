import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {TeamHealthResultCard_stage$key} from '~/__generated__/TeamHealthResultCard_stage.graphql'
import {ArrowForward} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthDistributionChart from './TeamHealthDistributionChart'
import TeamHealthResultComment from './TeamHealthResultComment'
import TeamHealthScoreDelta from './TeamHealthScoreDelta'
import TeamHealthTrendChart, {type TeamHealthTrendPoint} from './TeamHealthTrendChart'

// a neutral, made-up spread to sit under the blur when the real one is withheld, so nothing about
// how the few respondents voted can be read through it
const HIDDEN_SPREAD_PLACEHOLDER = [1, 2, 3, 2, 1]

interface Props {
  stage: TeamHealthResultCard_stage$key
  // zero-based position of this stage within the result phase
  stageIndex: number
  // total number of result stages
  stageCount: number
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  onPrev: () => void
  onNext: () => void
}

const TeamHealthResultCard = (props: Props) => {
  const {stage: stageRef, stageIndex, stageCount, orderedCategoryIds, onPrev, onNext} = props
  const stage = useFragment(
    graphql`
      fragment TeamHealthResultCard_stage on TeamHealthResultStage {
        score
        respondentCount
        spreadScores
        scoreHistory {
          endedAt
          score
        }
        meeting {
          endedAt
        }
        # aliased for the same reason as TeamHealthResponseCard: NewMeetingStage.question is a
        # String on the embedded TeamHealthStage, so the raw key would conflict
        healthQuestion: question {
          question
          category {
            id
            name
          }
        }
        responses {
          id
          commentParaphrased
          ...TeamHealthResultComment_response
        }
      }
    `,
    stageRef
  )
  const {
    score,
    respondentCount,
    spreadScores,
    scoreHistory,
    meeting,
    healthQuestion: question,
    responses
  } = stage
  const distribution = [0, 0, 0, 0, 0]
  spreadScores?.forEach((answer) => {
    if (answer >= 1 && answer <= 5) distribution[answer - 1]!++
  })
  const answerCount = respondentCount ?? 0
  const isSpreadHidden = !spreadScores
  const comments = responses.filter(({commentParaphrased}) => !!commentParaphrased)
  const trendPoints: TeamHealthTrendPoint[] = [
    ...scoreHistory,
    ...(score == null || !meeting.endedAt ? [] : [{endedAt: meeting.endedAt, score}])
  ]
  const firstCycle = trendPoints[0]
  const lastCycle = trendPoints.at(-1)
  const previousCycle = scoreHistory.at(-1)
  const spansOneMonth =
    !!firstCycle && !!lastCycle && dayjs(firstCycle.endedAt).isSame(lastCycle.endedAt, 'month')
  const rangeFormat = spansOneMonth ? 'MMM D' : 'MMM'
  const trendCaption =
    !firstCycle || !lastCycle || !previousCycle
      ? ''
      : `${dayjs(firstCycle.endedAt).format(rangeFormat)} – ${dayjs(lastCycle.endedAt).format(rangeFormat)} · was ${previousCycle.score.toFixed(1)} on ${dayjs(previousCycle.endedAt).format('MMM D')}`
  const isLast = stageIndex === stageCount - 1

  return (
    <div className='w-full rounded-2xl bg-surface-card p-8 shadow-card'>
      <div className='flex items-center justify-between'>
        <span
          className={cn(
            'inline-flex whitespace-nowrap rounded-md px-2.5 py-1 font-semibold text-sm',
            getTeamHealthCategoryColor(question.category.id, orderedCategoryIds)
          )}
        >
          {question.category.name}
        </span>
        <span className='font-semibold text-fg-muted text-sm'>
          Topic {stageIndex + 1} of {stageCount}
        </span>
      </div>
      <h2 className='mt-6 font-bold text-2xl text-fg-primary'>{question.question}</h2>
      <div className='mt-6 flex items-end gap-3'>
        <span className='font-bold text-5xl text-fg-primary leading-none'>
          {score?.toFixed(1) ?? '—'}
        </span>
        <span className='pb-1 text-fg-muted text-lg'>/ 5</span>
        <TeamHealthScoreDelta
          className='pb-1 text-sm'
          score={score}
          previousScore={previousCycle?.score}
        />
        <span className='pb-1 text-fg-muted text-sm'>
          {previousCycle
            ? `was ${previousCycle.score.toFixed(1)} last cycle`
            : 'first time this category was asked'}
        </span>
      </div>
      <div
        className={cn(
          'mt-6 grid grid-cols-1 gap-6',
          scoreHistory.length > 0 ? 'sm:grid-cols-2' : 'sm:mx-auto sm:max-w-sm'
        )}
      >
        {scoreHistory.length > 0 && (
          <div>
            <div className='font-semibold text-fg-muted text-xs uppercase tracking-wide'>
              Trend · last {trendPoints.length} checks
            </div>
            <div className='mt-2'>
              <TeamHealthTrendChart points={trendPoints} />
            </div>
            <div className='mt-1 text-fg-muted text-sm'>{trendCaption}</div>
          </div>
        )}
        <div>
          <div className='font-semibold text-fg-muted text-xs uppercase tracking-wide'>
            This check · 1–5 spread
          </div>
          <div className='relative mt-2'>
            <div className={cn(isSpreadHidden && 'pointer-events-none select-none blur-sm')}>
              <TeamHealthDistributionChart
                distribution={isSpreadHidden ? HIDDEN_SPREAD_PLACEHOLDER : distribution}
              />
            </div>
            {isSpreadHidden && (
              <div className='absolute inset-0 flex items-center justify-center px-4'>
                <span className='rounded-md border border-hairline bg-surface-raised px-3 py-1.5 text-center font-semibold text-fg-secondary text-xs shadow-card'>
                  Spread hidden until more people answer
                </span>
              </div>
            )}
          </div>
          <div className='mt-1 text-fg-muted text-sm'>
            {answerCount} {plural(answerCount, 'answer')}
          </div>
        </div>
      </div>
      {comments.length > 0 && (
        <div className='mt-8'>
          <div className='font-semibold text-fg-muted text-xs uppercase tracking-wide'>
            {comments.length} {plural(comments.length, 'comment')} · anonymous ones are reworded by
            AI
          </div>
          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {comments.map((response) => (
              <TeamHealthResultComment key={response.id} response={response} />
            ))}
          </div>
        </div>
      )}
      <div className='mt-8 flex items-center justify-between'>
        {stageIndex === 0 ? (
          <div />
        ) : (
          <Button variant='ghost' shape='default' size='md' onClick={onPrev}>
            Back
          </Button>
        )}
        {!isLast && (
          <Button variant='primary' shape='default' size='md' className='gap-1' onClick={onNext}>
            Next topic
            <ArrowForward className='size-5' />
          </Button>
        )}
      </div>
    </div>
  )
}

export default TeamHealthResultCard
