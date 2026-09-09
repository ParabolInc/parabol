import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthResponseCard_stage$key} from '~/__generated__/TeamHealthResponseCard_stage.graphql'
import {ArrowForward} from '~/ui/icons'
import useSaveTeamHealthResponse from '../../hooks/useSaveTeamHealthResponse'
import {Button} from '../../ui/Button/Button'
import TeamHealthAnonymousToggle from './TeamHealthAnonymousToggle'
import TeamHealthResponseCardHeader from './TeamHealthResponseCardHeader'
import TeamHealthScoreScale from './TeamHealthScoreScale'

interface Props {
  meetingId: string
  stage: TeamHealthResponseCard_stage$key
  // zero-based index of this stage within the response phase
  stageIndex: number
  // total number of response stages
  stageCount: number
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  preferredName: string
  picture: string
  // why anonymity is unavailable, else null. See TeamHealthAnonymousToggle
  aiDisabledReason: string | null
  // set when the viewer is spectating: the question is visible but read-only until they opt in
  onShareResponses?: () => void
  onPrev: () => void
  onNext: () => void
}

const TeamHealthResponseCard = (props: Props) => {
  const {
    meetingId,
    stage: stageRef,
    stageIndex,
    stageCount,
    orderedCategoryIds,
    preferredName,
    picture,
    aiDisabledReason,
    onShareResponses,
    onPrev,
    onNext
  } = props
  const stage = useFragment(
    graphql`
      fragment TeamHealthResponseCard_stage on TeamHealthResponseStage {
        id
        # aliased: NewMeetingStage.question is a String on the embedded TeamHealthStage, so the raw
        # key would conflict with this TeamHealthQuestion field
        healthQuestion: question {
          question
          description
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
  const {id: stageId, healthQuestion: question, viewerResponse} = stage
  const [score, setScore] = useState<number | null>(viewerResponse?.score ?? null)
  const [comment, setComment] = useState(viewerResponse?.comment ?? '')
  // the card is keyed by stage id, so anonymity resets to the safe default on every stage. Without
  // AI there is nothing to reword the comment, so the default flips to sending it as written
  const [isAnonymous, setIsAnonymous] = useState(!aiDisabledReason)
  const save = useSaveTeamHealthResponse(meetingId, stageId)
  const isSpectating = !!onShareResponses

  // clicking the score already picked clears it, so a question answered by accident goes back to
  // unanswered rather than being stuck with a number the author never meant
  const onSelectScore = (clickedScore: number) => {
    const nextScore = score === clickedScore ? null : clickedScore
    setScore(nextScore)
    save({score: nextScore, comment, isAnonymous})
  }

  const onToggleAnonymous = () => {
    setIsAnonymous(!isAnonymous)
    save({score, comment, isAnonymous: !isAnonymous})
  }

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
      {question.description && (
        <p className='mt-2 text-center text-fg-muted'>{question.description}</p>
      )}
      <div className='mt-8'>
        <TeamHealthScoreScale
          score={score}
          onSelectScore={isSpectating ? undefined : onSelectScore}
        />
      </div>
      {isSpectating ? (
        <div className='mt-6 flex flex-col items-center gap-3 rounded-lg border border-hairline bg-surface-well p-4 text-center'>
          <div className='text-fg-secondary text-sm'>
            As the team lead, you're not asked these questions by default.
          </div>
          <Button variant='secondary' shape='default' size='md' onClick={onShareResponses}>
            Share your responses
          </Button>
        </div>
      ) : (
        <div className='mt-6 rounded-lg border border-hairline-field bg-surface-input focus-within:border-accent'>
          <textarea
            className='w-full resize-none bg-transparent p-3 text-fg-primary placeholder:text-fg-muted focus:outline-hidden'
            rows={2}
            placeholder='Add an optional comment'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => save({score, comment, isAnonymous})}
          />
          <TeamHealthAnonymousToggle
            isAnonymous={isAnonymous}
            preferredName={preferredName}
            picture={picture}
            aiDisabledReason={aiDisabledReason}
            isVisible={!!comment}
            onToggle={onToggleAnonymous}
          />
        </div>
      )}
      <div className='mt-6 flex items-center justify-between'>
        {stageIndex === 0 ? (
          <div />
        ) : (
          <Button variant='ghost' shape='default' size='md' onClick={onPrev}>
            Back
          </Button>
        )}
        <Button variant='primary' shape='default' size='md' className='gap-1' onClick={onNext}>
          {stageIndex !== stageCount - 1 ? 'Next' : isSpectating ? 'Skip to results' : 'Submit'}
          <ArrowForward className='size-5' />
        </Button>
      </div>
    </div>
  )
}

export default TeamHealthResponseCard
