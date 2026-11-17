import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthEndedResponseCard_stage$key} from '~/__generated__/TeamHealthEndedResponseCard_stage.graphql'
import {ArrowForward, Lock} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import TeamHealthResponseCardHeader from './TeamHealthResponseCardHeader'
import TeamHealthScoreScale from './TeamHealthScoreScale'

interface Props {
  stage: TeamHealthEndedResponseCard_stage$key
  // zero-based index of this stage within the response phase
  stageIndex: number
  // total number of response stages
  stageCount: number
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  onPrev: () => void
  onNext: () => void
}

// once the meeting has ended the answers are part of the record the team is reading, so this stage
// stops being a form: the scores are a summary of what the viewer said and the comment is frozen
const TeamHealthEndedResponseCard = (props: Props) => {
  const {stage: stageRef, stageIndex, stageCount, orderedCategoryIds, onPrev, onNext} = props
  const stage = useFragment(
    graphql`
      fragment TeamHealthEndedResponseCard_stage on TeamHealthResponseStage {
        # aliased for the same reason as TeamHealthResponseCard: NewMeetingStage.question is a
        # String on the embedded TeamHealthStage, so the raw key would conflict
        healthQuestion: question {
          question
          category {
            id
            name
          }
        }
        viewerResponse {
          score
          comment
        }
      }
    `,
    stageRef
  )
  const {healthQuestion: question, viewerResponse} = stage
  const isLast = stageIndex === stageCount - 1

  return (
    <div className='w-full max-w-2xl rounded-2xl bg-surface-card p-8 shadow-card'>
      <TeamHealthResponseCardHeader
        categoryId={question.category.id}
        categoryName={question.category.name}
        orderedCategoryIds={orderedCategoryIds}
        stageIndex={stageIndex}
        stageCount={stageCount}
      />
      <h2 className='mt-6 text-center font-bold text-2xl text-fg-primary'>{question.question}</h2>
      <div className='mt-2 flex items-center justify-center gap-1.5 text-fg-muted text-sm'>
        <Lock className='size-4' />
        <span>This meeting has ended, so your answer is locked</span>
      </div>
      <div className='mt-8'>
        <TeamHealthScoreScale score={viewerResponse?.score ?? null} />
      </div>
      <textarea
        className='mt-6 w-full resize-none rounded-lg border border-hairline bg-surface-well p-3 text-fg-primary placeholder:text-fg-muted focus:outline-hidden'
        rows={2}
        readOnly
        placeholder="You didn't leave a comment"
        value={viewerResponse?.comment ?? ''}
      />
      <div className='mt-6 flex items-center justify-between'>
        {stageIndex === 0 ? (
          <div />
        ) : (
          <Button variant='ghost' shape='default' size='md' onClick={onPrev}>
            Back
          </Button>
        )}
        <Button variant='primary' shape='default' size='md' className='gap-1' onClick={onNext}>
          {isLast ? 'See results' : 'Next'}
          <ArrowForward className='size-5' />
        </Button>
      </div>
    </div>
  )
}

export default TeamHealthEndedResponseCard
