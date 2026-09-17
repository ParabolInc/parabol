import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthNextSurveyPreview_template$key} from '../../../__generated__/TeamHealthNextSurveyPreview_template.graphql'
import {cn} from '../../../ui/cn'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryDotColor
} from './getTeamHealthCategoryColor'

interface Props {
  templateRef: TeamHealthNextSurveyPreview_template$key
  className?: string
}

const FLASH_MS = 1200

/**
 * The selection model is not obvious: picking twenty questions does not mean a twenty-question
 * survey. Each round asks one question per category, so the survey is as long as the category count
 * and the extra questions deepen a category's pool instead of lengthening the meeting.
 *
 * This shows a slot per category rather than a question per category, because the draw happens
 * server-side when the meeting is created (rotateTeamHealthQuestionIds, against series history that
 * does not exist yet) — naming a question here would be a guess that the meeting then contradicts.
 * The pool size is knowable now, so that is what it commits to. Flashing the row whose pool just
 * changed is what teaches the rule: ticking a fourth question grows a count, never the slot list.
 */
const TeamHealthNextSurveyPreview = (props: Props) => {
  const {templateRef, className} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthNextSurveyPreview_template on TeamHealthTemplate {
        questions {
          id
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

  const categories = getOrderedTeamHealthCategories([{questions}])
  const orderedCategoryIds = categories.map((category) => category.id)
  const poolSizeByCategoryId = questions.reduce(
    (sizes, {category}) => {
      sizes[category.id] = (sizes[category.id] ?? 0) + 1
      return sizes
    },
    {} as Record<string, number>
  )

  // the effect keys off the serialized counts, not the relay array, so a re-render that hands back
  // an equal-but-new array cannot re-trigger the flash
  const poolSizeKey = orderedCategoryIds.map((id) => `${id}:${poolSizeByCategoryId[id]}`).join()
  const [flashedCategoryIds, setFlashedCategoryIds] = useState<ReadonlySet<string>>(new Set())
  const previousPoolSizes = useRef(poolSizeByCategoryId)
  useEffect(() => {
    const previous = previousPoolSizes.current
    previousPoolSizes.current = poolSizeByCategoryId
    const changed = new Set(
      orderedCategoryIds.filter((id) => (previous[id] ?? 0) !== (poolSizeByCategoryId[id] ?? 0))
    )
    // a brand new category is its own explanation (a slot appears); only flash a pool that grew or
    // shrank underneath a slot that was already there
    changed.forEach((id) => {
      if (previous[id] === undefined) changed.delete(id)
    })
    if (changed.size === 0) return
    setFlashedCategoryIds(changed)
    const timeout = setTimeout(() => setFlashedCategoryIds(new Set()), FLASH_MS)
    return () => clearTimeout(timeout)
  }, [poolSizeKey])

  if (categories.length === 0) return null

  return (
    <div className={cn('rounded-lg border border-hairline bg-surface-card p-4', className)}>
      <div className='flex items-baseline justify-between pb-3'>
        <span className='font-semibold text-fg-primary text-sm'>Your next survey</span>
        <span className='text-fg-secondary text-xs'>
          {categories.length} question{categories.length === 1 ? '' : 's'} · one per category
        </span>
      </div>
      <div className='flex flex-col gap-1'>
        {categories.map((category) => {
          const poolSize = poolSizeByCategoryId[category.id]!
          return (
            <div
              key={category.id}
              className={cn(
                'flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-500',
                flashedCategoryIds.has(category.id) && 'bg-surface-well duration-100'
              )}
            >
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-full',
                  getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
                )}
              />
              <span className='min-w-0 grow truncate text-fg-primary text-sm'>{category.name}</span>
              <span className='shrink-0 text-fg-secondary text-xs'>
                1 of your {poolSize} question{poolSize === 1 ? '' : 's'}
              </span>
            </div>
          )
        })}
      </div>
      <div className='mt-3 border-hairline border-t pt-3 text-fg-secondary text-xs'>
        Each meeting draws one question per category, favoring the ones your team has answered
        least. The more you pick, the longer it takes before a question comes around again.
      </div>
    </div>
  )
}

export default TeamHealthNextSurveyPreview
