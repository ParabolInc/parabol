import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Refresh} from '~/ui/icons'
import type {TeamHealthMeetingPreview_template$key} from '../../../__generated__/TeamHealthMeetingPreview_template.graphql'
import {Button} from '../../../ui/Button/Button'
import plural from '../../../utils/plural'
import drawTeamHealthPreviewQuestions from './drawTeamHealthPreviewQuestions'
import TeamHealthMeetingPreviewCard from './TeamHealthMeetingPreviewCard'

interface Props {
  templateRef: TeamHealthMeetingPreview_template$key
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
}

const makeSeed = () => Math.floor(Math.random() * 0x7fffffff)

const TeamHealthMeetingPreview = (props: Props) => {
  const {templateRef, orderedCategoryIds} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthMeetingPreview_template on TeamHealthTemplate {
        questions {
          id
          question
          description
          category {
            id
            name
          }
        }
      }
    `,
    templateRef
  )
  const [seed, setSeed] = useState(makeSeed)
  const [stageIndex, setStageIndex] = useState(0)
  const {drawnQuestions, largestPoolSize} = drawTeamHealthPreviewQuestions(template.questions, seed)
  const stageCount = drawnQuestions.length
  if (stageCount === 0) return null

  // unchecking a whole category can leave the step past the end of the draw
  const currentIndex = Math.min(stageIndex, stageCount - 1)
  const currentQuestion = drawnQuestions[currentIndex]!
  const canRedraw = largestPoolSize > 1

  const redraw = () => {
    setSeed(makeSeed())
    setStageIndex(0)
  }

  return (
    <section className='mb-4 rounded-lg border border-hairline bg-surface-app p-4'>
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0'>
          <h2 className='font-semibold text-fg-primary text-sm'>Preview a meeting</h2>
          <p className='text-fg-muted text-xs'>
            Each meeting asks {stageCount} {plural(stageCount, 'question')}, one from each category.
            {canRedraw && ' This is one possible draw.'}
          </p>
        </div>
        {canRedraw && (
          <Button variant='outline' size='sm' className='gap-1' onClick={redraw}>
            <Refresh className='size-4' />
            Draw again
          </Button>
        )}
      </div>
      <TeamHealthMeetingPreviewCard
        key={currentQuestion.id}
        question={currentQuestion}
        orderedCategoryIds={orderedCategoryIds}
        stageIndex={currentIndex}
        stageCount={stageCount}
        onPrev={() => setStageIndex(currentIndex - 1)}
        onNext={() => setStageIndex((currentIndex + 1) % stageCount)}
      />
      <p className='mt-3 text-fg-muted text-xs'>
        {canRedraw
          ? `Later meetings favor questions that haven't been asked yet, so every question comes up within ${largestPoolSize} meetings.`
          : 'Every meeting asks these same questions.'}
      </p>
    </section>
  )
}

export default TeamHealthMeetingPreview
