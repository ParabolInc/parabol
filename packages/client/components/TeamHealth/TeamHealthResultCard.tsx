import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultCard_stage$key} from '~/__generated__/TeamHealthResultCard_stage.graphql'
import {ArrowForward} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthDistributionChart from './TeamHealthDistributionChart'
import TeamHealthScoreDelta from './TeamHealthScoreDelta'

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
        previousScore
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
          score
          commentParaphrased
        }
      }
    `,
    stageRef
  )
  const {score, previousScore, healthQuestion: question, responses} = stage
  const distribution = [0, 0, 0, 0, 0]
  responses.forEach((response) => {
    const answer = response.score
    if (answer != null && answer >= 1 && answer <= 5) distribution[answer - 1]!++
  })
  const answerCount = distribution.reduce((sum, count) => sum + count, 0)
  const comments = responses
    .map(({commentParaphrased}) => commentParaphrased)
    .filter((comment): comment is string => !!comment)
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
          previousScore={previousScore}
        />
        <span className='pb-1 text-fg-muted text-sm'>
          {previousScore == null
            ? 'first time this category was asked'
            : `was ${previousScore.toFixed(1)} last cycle`}
        </span>
      </div>
      <div className='mt-6'>
        <div className='font-semibold text-fg-muted text-xs uppercase tracking-wide'>
          This check · 1–5 spread
        </div>
        <div className='mt-2'>
          <TeamHealthDistributionChart distribution={distribution} />
        </div>
        <div className='mt-1 text-fg-muted text-sm'>
          {answerCount} {plural(answerCount, 'answer')}
        </div>
      </div>
      {comments.length > 0 && (
        <div className='mt-8'>
          <div className='font-semibold text-fg-muted text-xs uppercase tracking-wide'>
            {comments.length} anonymous {plural(comments.length, 'comment')} · paraphrased before
            display
          </div>
          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {comments.map((comment, idx) => (
              <div key={idx} className='rounded-lg bg-surface-well p-4 text-fg-primary'>
                “{comment}”
              </div>
            ))}
          </div>
          <div className='mt-3 text-fg-muted text-xs'>
            Authorship is never shown — comments read like reflections
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
