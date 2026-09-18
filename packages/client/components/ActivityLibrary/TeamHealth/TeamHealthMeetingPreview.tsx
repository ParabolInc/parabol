import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthMeetingPreview_template$key} from '../../../__generated__/TeamHealthMeetingPreview_template.graphql'
import plural from '../../../utils/plural'
import {getTeamHealthCategoryDotColor} from './getTeamHealthCategoryColor'
import TeamHealthMeetingPreviewFooter from './TeamHealthMeetingPreviewFooter'
import TeamHealthMeetingPreviewPager from './TeamHealthMeetingPreviewPager'
import TeamHealthMeetingPreviewQuestion from './TeamHealthMeetingPreviewQuestion'

interface Props {
  templateRef: TeamHealthMeetingPreview_template$key
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  // first-meeting questions that changed in the edit session that just ended
  changedQuestionIds: ReadonlySet<string>
  // absent when the viewer can't edit this template
  onEdit?: () => void
}

const TeamHealthMeetingPreview = (props: Props) => {
  const {templateRef, orderedCategoryIds, changedQuestionIds, onEdit} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthMeetingPreview_template on TeamHealthTemplate {
        questions {
          id
          category {
            id
          }
        }
        upcomingMeetingPreviews {
          meetingNumber
          questions {
            id
            question
            category {
              id
              name
            }
          }
        }
      }
    `,
    templateRef
  )
  const {questions, upcomingMeetingPreviews} = template
  const [selectedMeetingNumber, setSelectedMeetingNumber] = useState(1)
  const meeting =
    upcomingMeetingPreviews.find(({meetingNumber}) => meetingNumber === selectedMeetingNumber) ??
    upcomingMeetingPreviews[0]
  if (!meeting) return null
  const {meetingNumber, questions: meetingQuestions} = meeting

  // a category with n questions asks each of them once every n meetings, so the biggest category
  // sets how long it takes for every question to come up
  const countByCategoryId = new Map<string, number>()
  questions.forEach(({category}) =>
    countByCategoryId.set(category.id, (countByCategoryId.get(category.id) ?? 0) + 1)
  )
  const largestCategorySize = Math.max(...countByCategoryId.values())
  const questionCount = `${meetingQuestions.length} ${plural(meetingQuestions.length, 'question')}`

  return (
    // sized like TeamHealthSurveyFlowAnimation so the card sits squarely under it
    <section className='mb-4 max-w-[612px] rounded-lg border border-hairline bg-surface-app p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <TeamHealthMeetingPreviewPager
          meetingNumber={meetingNumber}
          meetingCount={upcomingMeetingPreviews.length}
          onChange={setSelectedMeetingNumber}
        />
        <span className='rounded-full bg-surface-well px-2 py-0.5 font-medium text-fg-secondary text-xs dark:bg-surface-raised'>
          Example
        </span>
      </div>
      <p className='mt-1 text-fg-muted text-xs'>
        {meetingNumber === 1
          ? `Your first meeting will ask ${questionCount}, one from each category.`
          : `Meeting #${meetingNumber} will ask ${questionCount}, one from each category.`}
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
      <TeamHealthMeetingPreviewFooter largestCategorySize={largestCategorySize} onEdit={onEdit} />
    </section>
  )
}

export default TeamHealthMeetingPreview
