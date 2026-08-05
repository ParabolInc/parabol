import {MonitorHeart} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthResponseCard_stage$key} from '~/__generated__/TeamHealthResponseCard_stage.graphql'
import useSetTeamHealthResponseMutation from '../../mutations/useSetTeamHealthResponseMutation'
import {cn} from '../../ui/cn'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'

interface Props {
  meetingId: string
  stage: TeamHealthResponseCard_stage$key
  // zero-based index of this stage within the response phase
  stageIndex: number
  // total number of response stages
  stageCount: number
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
}

const SCORES = [1, 2, 3, 4, 5]
// low (disagree) -> high (agree), using paletteV3 tailwind classes. All five are saturated mid-tones
// that hold their white label on either theme — slate-600 rather than slate-400 for the neutral,
// which on a dark card would have been a near-white chip with white text on it.
const SCORE_COLORS = [
  'bg-tomato-500',
  'bg-gold-500',
  'bg-slate-600',
  'bg-jade-400',
  'bg-jade-500'
] as const

const TeamHealthResponseCard = (props: Props) => {
  const {meetingId, stage: stageRef, stageIndex, stageCount, orderedCategoryIds} = props
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
  const [execute] = useSetTeamHealthResponseMutation()

  const save = (nextScore: number | null, nextComment: string) => {
    execute({
      variables: {meetingId, stageId, score: nextScore, comment: nextComment || null}
    })
  }

  const onSelectScore = (nextScore: number) => {
    setScore(nextScore)
    save(nextScore, comment)
  }

  return (
    <div className='w-full max-w-2xl rounded-2xl bg-surface-card p-8 shadow-card'>
      <div className='flex items-center justify-between'>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold',
            getTeamHealthCategoryColor(question.category.id, orderedCategoryIds)
          )}
        >
          <MonitorHeart className='size-5' />
          <span>{question.category.name}</span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex gap-1'>
            {Array.from({length: stageCount}).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  // grape-700 disappears into the dark card (grape-750), so dark lightens the fill
                  'h-1.5 w-4 rounded-full',
                  idx <= stageIndex ? 'bg-grape-700 dark:bg-grape-200' : 'bg-surface-well'
                )}
              />
            ))}
          </div>
          <span className='font-semibold text-fg-muted text-sm'>
            {stageIndex + 1} of {stageCount}
          </span>
        </div>
      </div>
      <h2 className='mt-6 text-center font-bold text-2xl text-fg-primary'>{question.question}</h2>
      {question.description && (
        <p className='mt-2 text-center text-fg-muted'>{question.description}</p>
      )}
      <div className='mt-8 flex items-center justify-center gap-4'>
        {SCORES.map((value, idx) => {
          const isSelected = score === value
          return (
            <button
              key={value}
              type='button'
              onClick={() => onSelectScore(value)}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full font-semibold text-lg text-white transition-transform',
                SCORE_COLORS[idx],
                isSelected
                  ? 'scale-110 ring-2 ring-grape-700 ring-offset-2 ring-offset-surface-card dark:ring-grape-200'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              {value}
            </button>
          )
        })}
      </div>
      <div className='mt-2 flex justify-between text-fg-muted text-xs'>
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
      <textarea
        className='mt-6 w-full resize-none rounded-lg border border-hairline-field bg-surface-input p-3 text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-hidden'
        rows={2}
        placeholder='Add an optional comment (anonymous)'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onBlur={() => save(score, comment)}
      />
    </div>
  )
}

export default TeamHealthResponseCard
