import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthMeetingPreview_template$key} from '../../../__generated__/TeamHealthMeetingPreview_template.graphql'
import {Edit} from '../../../ui/icons'
import plural from '../../../utils/plural'
import {getTeamHealthCategoryDotColor} from './getTeamHealthCategoryColor'
import TeamHealthMeetingPreviewPager from './TeamHealthMeetingPreviewPager'
import TeamHealthMeetingPreviewQuestion from './TeamHealthMeetingPreviewQuestion'

interface Props {
  templateRef: TeamHealthMeetingPreview_template$key
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  // the question ids each meeting of a new series would ask (see useTeamHealthMeetingPreviews)
  meetingPreviews: ReadonlyArray<ReadonlyArray<string>>
  // first-meeting questions that changed in the edit session that just ended
  changedQuestionIds: ReadonlySet<string>
  // absent when the viewer can't edit this template
  onEdit?: () => void
}

const TeamHealthMeetingPreview = (props: Props) => {
  const {templateRef, orderedCategoryIds, meetingPreviews, changedQuestionIds, onEdit} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthMeetingPreview_template on TeamHealthTemplate {
        questions {
          id
          question
          category {
            id
            name
          }
        }
      }
    `,
    templateRef
  )
  const {questions} = template
  const [selectedMeetingNumber, setSelectedMeetingNumber] = useState(1)
  const meetingNumber = Math.min(selectedMeetingNumber, meetingPreviews.length)
  const meetingQuestionIds = meetingPreviews[meetingNumber - 1]
  if (!meetingQuestionIds) return null
  const meetingQuestions = meetingQuestionIds
    .map((questionId) => questions.find(({id}) => id === questionId))
    .filter((question) => !!question)

  const questionCount = `${meetingQuestions.length} ${plural(meetingQuestions.length, 'question')}`

  return (
    // sized like TeamHealthSurveyFlowAnimation so the card sits squarely under it
    <section className='mb-4 max-w-[612px] rounded-lg border border-hairline bg-surface-app p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <TeamHealthMeetingPreviewPager
          meetingNumber={meetingNumber}
          meetingCount={meetingPreviews.length}
          onChange={setSelectedMeetingNumber}
        />
        <span className='rounded-full bg-surface-well px-2 py-0.5 font-medium text-fg-secondary text-xs dark:bg-surface-raised'>
          Example
        </span>
      </div>
      <p className='mt-1 text-fg-muted text-xs'>
        {meetingNumber === 1 ? 'Your first meeting' : `Meeting #${meetingNumber}`} will ask{' '}
        {questionCount}, one from each category.
      </p>
      <ol className='mt-3 flex list-none flex-col gap-2 p-0'>
        {meetingQuestions.map(({id, question, category}) => (
          <TeamHealthMeetingPreviewQuestion
            key={id}
            question={question}
            categoryName={category.name}
            categoryDotColor={getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)}
            isChanged={meetingNumber === 1 && changedQuestionIds.has(id)}
          />
        ))}
      </ol>
      <div className='mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs'>
        <p className='text-fg-muted'>
          {meetingPreviews.length > 1
            ? `Questions fully rotate every ${meetingPreviews.length} meetings`
            : 'Every meeting asks these same questions.'}
        </p>
        {onEdit && (
          <button
            type='button'
            onClick={onEdit}
            className='flex cursor-pointer items-center gap-1 font-semibold text-accent hover:underline'
          >
            <Edit className='size-3.5' />
            Edit question bank
          </button>
        )}
      </div>
    </section>
  )
}

export default TeamHealthMeetingPreview
