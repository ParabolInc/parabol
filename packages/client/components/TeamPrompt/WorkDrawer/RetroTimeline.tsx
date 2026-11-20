import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import groupIssuesByDay from './groupIssuesByDay'
import RetroTimelineDay from './RetroTimelineDay'
import RetryableError from './RetryableError'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  issues: InspirationDraft['issues']
  // The issues a draft above was drawn from
  draftedKeys: ReadonlySet<string>
  hasOlder: boolean
  loadingOlder: boolean
  olderError: string | null
  loadOlder: () => void
}

const RetroTimeline = (props: Props) => {
  const {issues, draftedKeys, hasOlder, loadingOlder, olderError, loadOlder} = props
  const days = groupIssuesByDay(issues)
  const loadOlderTrigger = useLoadNextOnScrollBottom({
    hasNext: hasOlder && !olderError,
    isLoadingNext: loadingOlder,
    loadNext: loadOlder
  })
  return (
    <div className='flex flex-col'>
      {days.map(({key, label, issues: dayIssues}) => (
        <RetroTimelineDay key={key} label={label} issues={dayIssues} draftedKeys={draftedKeys} />
      ))}
      {loadOlderTrigger}
      {loadingOlder && (
        <p role='status' className='m-0 pt-3.5 font-semibold text-fg-secondary text-xs'>
          Finding older work
          <Ellipsis />
        </p>
      )}
      {olderError && <RetryableError message={olderError} onRetry={loadOlder} className='pt-3.5' />}
    </div>
  )
}

export default RetroTimeline
