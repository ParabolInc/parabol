import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import {Button} from '../../../ui/Button/Button'
import Ellipsis from '../../Ellipsis/Ellipsis'
import groupIssuesByDay from './groupIssuesByDay'
import RetroTimelineDay from './RetroTimelineDay'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  issues: InspirationDraft['issues']
  hasOlder: boolean
  loadingOlder: boolean
  olderError: string | null
  loadOlder: () => void
}

const RetroTimeline = (props: Props) => {
  const {issues, hasOlder, loadingOlder, olderError, loadOlder} = props
  const days = groupIssuesByDay(issues)
  const loadOlderTrigger = useLoadNextOnScrollBottom({
    hasNext: hasOlder && !olderError,
    isLoadingNext: loadingOlder,
    loadNext: loadOlder
  })
  return (
    <div className='flex flex-col'>
      {days.map(({key, label, issues: dayIssues}) => (
        <RetroTimelineDay key={key} label={label} issues={dayIssues} />
      ))}
      {loadOlderTrigger}
      {loadingOlder && (
        <p role='status' className='m-0 pt-3.5 font-semibold text-fg-secondary text-xs'>
          Finding older work
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
