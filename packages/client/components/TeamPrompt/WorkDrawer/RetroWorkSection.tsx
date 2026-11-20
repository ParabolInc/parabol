import Ellipsis from '../../Ellipsis/Ellipsis'
import {issueCountLabel, NO_WORK_LINE} from './inspirationCopy'
import inspirationIssueKey from './inspirationIssueKey'
import RetroTimeline from './RetroTimeline'
import RetryableError from './RetryableError'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  draft: InspirationDraft | null
  drafting: boolean
  error: string | null
  onRetry: () => void
  aiOffMessage: string | null
  hasOlder: boolean
  loadingOlder: boolean
  olderError: string | null
  loadOlder: () => void
}

const RetroWorkSection = (props: Props) => {
  const {
    draft,
    drafting,
    error,
    onRetry,
    aiOffMessage,
    hasOlder,
    loadingOlder,
    olderError,
    loadOlder
  } = props
  const issues = drafting ? [] : (draft?.issues ?? [])
  const draftIdByIssueKey = new Map(
    (draft?.items ?? []).flatMap(({id, issues: draftIssues}) =>
      draftIssues.map((issue) => [inspirationIssueKey(issue), id] as const)
    )
  )
  const isEmpty = !!draft && !drafting && issues.length === 0
  return (
    <section aria-labelledby='retro-work-heading' aria-busy={drafting}>
      <div className='flex flex-col gap-1 px-4 pt-[18px]'>
        <div className='flex items-baseline justify-between gap-2'>
          <h3
            id='retro-work-heading'
            className='m-0 flex items-center font-semibold text-fg-primary text-sm'
          >
            {drafting ? 'Finding your work' : 'Your work'}
            {drafting && <Ellipsis />}
          </h3>
          {issues.length > 0 && (
            <span className='shrink-0 text-fg-muted text-xs'>{issueCountLabel(issues.length)}</span>
          )}
        </div>
        {aiOffMessage && <p className='m-0 text-fg-muted text-xs'>{aiOffMessage}</p>}
      </div>
      <div className='flex flex-col px-4 pb-4'>
        {error && <RetryableError message={error} onRetry={onRetry} className='pt-2.5' />}
        {isEmpty && (
          <p
            role='status'
            className='m-0 mt-2.5 rounded-md bg-surface-well px-3 py-2 text-fg-secondary text-sm'
          >
            {NO_WORK_LINE}
          </p>
        )}
        {issues.length > 0 && (
          <RetroTimeline
            issues={issues}
            draftIdByIssueKey={draftIdByIssueKey}
            hasOlder={hasOlder}
            loadingOlder={loadingOlder}
            olderError={olderError}
            loadOlder={loadOlder}
          />
        )}
      </div>
    </section>
  )
}

export default RetroWorkSection
