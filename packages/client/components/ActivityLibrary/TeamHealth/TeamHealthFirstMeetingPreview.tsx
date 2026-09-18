import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthFirstMeetingPreview_template$key} from '../../../__generated__/TeamHealthFirstMeetingPreview_template.graphql'
import {cn} from '../../../ui/cn'
import {getTeamHealthCategoryDotColor} from './getTeamHealthCategoryColor'

export const FIRST_MEETING_PREVIEW_ID = 'team-health-first-meeting-preview'

interface Props {
  templateRef: TeamHealthFirstMeetingPreview_template$key
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  changedQuestionIds: ReadonlySet<string>
}

const TeamHealthFirstMeetingPreview = (props: Props) => {
  const {templateRef, orderedCategoryIds, changedQuestionIds} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthFirstMeetingPreview_template on TeamHealthTemplate {
        questions {
          id
          category {
            id
          }
        }
        firstMeetingQuestions {
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
  const {questions, firstMeetingQuestions} = template
  if (firstMeetingQuestions.length === 0) return null

  // a category with n questions asks each of them once every n meetings, so the biggest category
  // sets how long it takes for every question to come up
  const countByCategoryId = new Map<string, number>()
  questions.forEach(({category}) =>
    countByCategoryId.set(category.id, (countByCategoryId.get(category.id) ?? 0) + 1)
  )
  const largestCategorySize = Math.max(...countByCategoryId.values())

  return (
    <section
      id={FIRST_MEETING_PREVIEW_ID}
      className='mb-4 scroll-mt-4 rounded-lg border border-hairline bg-surface-app p-4'
    >
      <p className='text-fg-muted text-xs'>
        {firstMeetingQuestions.length === 1
          ? 'Everyone answers this question'
          : `Everyone answers these ${firstMeetingQuestions.length} questions, one from each category`}
      </p>
      <ol className='mt-3 flex list-none flex-col gap-2 p-0'>
        {firstMeetingQuestions.map(({id, question, category}) => (
          <li
            key={id}
            className={cn(
              'flex gap-2.5 rounded-md border px-3 py-2 transition-colors duration-1000',
              changedQuestionIds.has(id)
                ? 'border-accent bg-accent/15'
                : 'border-hairline bg-surface-card'
            )}
          >
            <span
              className={cn(
                'mt-1.5 size-2.5 shrink-0 rounded-full',
                getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
              )}
            />
            <div className='min-w-0 grow'>
              <div className='flex items-center justify-between gap-2 font-semibold text-fg-secondary text-xs'>
                {category.name}
                {changedQuestionIds.has(id) && (
                  <span className='rounded border border-accent px-1 text-fg-primary'>Updated</span>
                )}
              </div>
              <div className='text-fg-primary text-sm'>{question}</div>
            </div>
          </li>
        ))}
      </ol>
      <p className='mt-3 text-fg-muted text-xs'>
        {largestCategorySize > 1
          ? `After that, questions rotate so every one comes up within ${largestCategorySize} meetings.`
          : 'Every meeting asks these same questions.'}
      </p>
    </section>
  )
}

export default TeamHealthFirstMeetingPreview
