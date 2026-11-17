import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthCoverage_template$key} from '~/__generated__/TeamHealthCoverage_template.graphql'
import {cn} from '../../../ui/cn'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryDotColor
} from './getTeamHealthCategoryColor'

const SECONDS_PER_CATEGORY = 30

interface Props {
  className?: string
  templateRef: TeamHealthCoverage_template$key
}

/**
 * The hover summary for a team health template. A team health template can carry dozens of
 * questions, so instead of listing them (the way a retro template lists its 3 prompts) we show what
 * the meeting measures: every category in the template, how many questions land in each, and how
 * long it takes to answer.
 */
export const TeamHealthCoverage = (props: Props) => {
  const {className, templateRef} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthCoverage_template on TeamHealthTemplate {
        questions {
          id
          questionType
          category {
            id
            name
            createdAt
          }
        }
      }
    `,
    templateRef
  )
  const {questions} = template
  if (questions.length === 0) return null

  // the same globally-ordered category list the template editor uses, so a category keeps the same
  // color in the tooltip, on its pill in the editor, and in the meeting
  const categories = getOrderedTeamHealthCategories([{questions}])
  const orderedCategoryIds = categories.map((category) => category.id)
  const countByCategoryId = questions.reduce(
    (counts, {category}) => {
      counts[category.id] = (counts[category.id] ?? 0) + 1
      return counts
    },
    {} as Record<string, number>
  )

  const isAllLikert = questions.every(({questionType}) => questionType === 'likert')
  const minutes = Math.max(1, Math.floor((categories.length * SECONDS_PER_CATEGORY) / 60))

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='pb-3 text-slate-300 text-xs'>
        {questions.length} question{questions.length === 1 ? '' : 's'} · {categories.length} categor
        {categories.length === 1 ? 'y' : 'ies'}
        {isAllLikert && ' · 1–5 scale'}
      </div>
      <div className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2'>
        {categories.map((category) => (
          <div key={category.id} className='flex items-center gap-2'>
            <span
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
              )}
            />
            <span className='min-w-0 grow truncate text-xs'>{category.name}</span>
            <span className='shrink-0 text-slate-300 text-xs'>
              {countByCategoryId[category.id]}
            </span>
          </div>
        ))}
      </div>
      <div className='mt-3 flex items-center justify-between gap-3 border-slate-500 border-t pt-3'>
        <div className='text-slate-300 text-xs'>~{minutes} min to answer</div>
        <div className='flex items-center gap-1.5'>
          {categories.map((category) => (
            <span
              key={category.id}
              className={cn(
                'size-2 rounded-full',
                getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamHealthCoverage
