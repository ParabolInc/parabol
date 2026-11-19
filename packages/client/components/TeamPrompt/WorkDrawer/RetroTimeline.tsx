import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import {Button} from '../../../ui/Button/Button'
import Ellipsis from '../../Ellipsis/Ellipsis'
import groupIssuesByWeek from './groupIssuesByWeek'
import RetroTimelineEvent from './RetroTimelineEvent'
import type {InspirationDraft} from './useInspirationDraft'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  issues: InspirationDraft['issues']
  dateRange: WorkDrawerDateRange
  hasOlder: boolean
  loadingOlder: boolean
  olderError: string | null
  loadingOlderLabel: string
  loadOlder: () => void
}

const RetroTimeline = (props: Props) => {
  const {issues, dateRange, hasOlder, loadingOlder, olderError, loadingOlderLabel, loadOlder} =
    props
  const weeks = groupIssuesByWeek(issues, dateRange.startAt, dateRange.endAt)
  const loadOlderTrigger = useLoadNextOnScrollBottom({
    hasNext: hasOlder && !olderError,
    isLoadingNext: loadingOlder,
    loadNext: loadOlder
  })
  return (
    <div className='flex flex-col'>
      {weeks.map(({key, label, issues: weekIssues}) => (
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
      {loadOlderTrigger}
      {loadingOlder && (
        <p role='status' className='m-0 pt-3.5 font-semibold text-fg-secondary text-xs'>
          {loadingOlderLabel}
          <Ellipsis />
        </p>
      )}
      {olderError && (
        <div className='flex items-center justify-between gap-2 pt-3.5'>
          <span className='text-fg-error text-sm'>{olderError}</span>
          <Button variant='outline' size='sm' className='shrink-0' onClick={loadOlder}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}

export default RetroTimeline
