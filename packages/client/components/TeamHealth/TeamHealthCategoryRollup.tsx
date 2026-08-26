import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthCategoryRollup_meeting$key} from '~/__generated__/TeamHealthCategoryRollup_meeting.graphql'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import {
  getTeamHealthCategoryColor,
  getTeamHealthCategoryDotColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'

interface Props {
  meeting: TeamHealthCategoryRollup_meeting$key
  // globally-ordered category ids that drive each category's color, computed once by the parent
  orderedCategoryIds: ReadonlyArray<string>
  className?: string
}

const TeamHealthCategoryRollup = (props: Props) => {
  const {meeting: meetingRef, orderedCategoryIds, className} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthCategoryRollup_meeting on TeamHealthMeeting {
        categoryScores {
          normalizedScore
          respondentCount
          responseCount
          category {
            id
            name
          }
        }
      }
    `,
    meetingRef
  )
  const {categoryScores} = meeting
  if (categoryScores.length === 0) return null

  return (
    <div className={cn('rounded-2xl bg-surface-card p-6 shadow-card', className)}>
      <h2 className='font-bold text-fg-primary text-xl'>How the team scored, by category</h2>
      <p className='mt-1 text-fg-muted text-sm'>
        Questions rotate every cycle, categories don't — so these are the numbers to watch over
        time.
      </p>
      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {categoryScores.map((categoryScore) => {
          const {category, normalizedScore, respondentCount, responseCount} = categoryScore
          return (
            <div key={category.id} className='rounded-xl bg-surface-well p-4'>
              <span
                className={cn(
                  'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-sm',
                  getTeamHealthCategoryColor(category.id, orderedCategoryIds)
                )}
              >
                {category.name}
              </span>
              <div className='mt-3 flex items-baseline gap-1'>
                <span className='font-bold text-3xl text-fg-primary'>{normalizedScore}</span>
                <span className='text-fg-muted text-sm'>/ 100</span>
              </div>
              <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-card'>
                <div
                  className={cn(
                    'h-full rounded-full',
                    getTeamHealthCategoryDotColor(category.id, orderedCategoryIds)
                  )}
                  style={{width: `${normalizedScore}%`}}
                />
              </div>
              <div className='mt-2 text-fg-muted text-xs'>
                {respondentCount} {plural(respondentCount, 'respondent')} · {responseCount}{' '}
                {plural(responseCount, 'answer')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TeamHealthCategoryRollup
