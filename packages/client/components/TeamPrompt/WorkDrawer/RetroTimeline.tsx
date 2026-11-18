import {useState} from 'react'
import {ExpandMore} from '~/ui/icons'
import groupIssuesByWeek from './groupIssuesByWeek'
import RetroTimelineEvent from './RetroTimelineEvent'
import type {InspirationDraft} from './useInspirationDraft'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

const MIN_SHOWN = 8
// Collapsing fewer than this many items would save less room than the button takes
const MIN_HIDDEN = 3

interface Props {
  issues: InspirationDraft['issues']
  dateRange: WorkDrawerDateRange
}

const RetroTimeline = (props: Props) => {
  const {issues, dateRange} = props
  const [isExpanded, setIsExpanded] = useState(false)
  const weeks = groupIssuesByWeek(issues, dateRange.startAt, dateRange.endAt)
  const ordered = weeks.flatMap((week) => week.issues)
  const lastDraftIdx = ordered.reduce((last, issue, idx) => (issue.draft ? idx : last), -1)
  const shownCount = Math.max(MIN_SHOWN, lastDraftIdx + 1)
  const hiddenCount = ordered.length - shownCount
  const isCollapsed = !isExpanded && hiddenCount >= MIN_HIDDEN
  let remaining = isCollapsed ? shownCount : ordered.length
  const shownWeeks = weeks.flatMap((week) => {
    if (remaining <= 0) return []
    const weekIssues = week.issues.slice(0, remaining)
    remaining -= weekIssues.length
    return [{...week, issues: weekIssues}]
  })
  return (
    <div className='flex flex-col'>
      {shownWeeks.map(({key, label, issues: weekIssues}) => (
        <div key={key} className='flex flex-col'>
          <h4 className='m-0 pt-3.5 pb-1.5 font-semibold text-fg-secondary text-xs'>{label}</h4>
          <ul className='m-0 flex list-none flex-col p-0'>
            {weekIssues.map((issue) => (
              <RetroTimelineEvent
                key={`${issue.service}:${issue.url || issue.title}:${issue.updatedAt}`}
                issue={issue}
              />
            ))}
          </ul>
        </div>
      ))}
      {isCollapsed && (
        <button
          type='button'
          aria-expanded={false}
          onClick={() => setIsExpanded(true)}
          className='mt-1.5 flex h-9 w-full cursor-pointer items-center gap-1 rounded-md px-1 font-semibold text-fg-secondary text-sm hover:bg-surface-hover'
        >
          <ExpandMore className='size-5' />
          Show {hiddenCount} more
        </button>
      )}
    </div>
  )
}

export default RetroTimeline
