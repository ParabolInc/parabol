import {AutoAwesome} from '~/ui/icons'
import Ellipsis from '../../Ellipsis/Ellipsis'
import {issueCountLabel, NO_WORK_LINE} from './inspirationCopy'
import RetroTimeline from './RetroTimeline'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  draft: InspirationDraft | null
  drafting: boolean
  draftingPages: boolean
  error: string | null
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
    draftingPages,
    error,
    aiOffMessage,
    hasOlder,
    loadingOlder,
    olderError,
    loadOlder
  } = props
  const issues = drafting ? [] : (draft?.issues ?? [])
  const draftCount = issues.filter((issue) => issue.draft).length
  const isEmpty = !!draft && !drafting && issues.length === 0
  const countLabel =
    issues.length === 0
      ? ''
      : aiOffMessage
        ? issueCountLabel(issues.length)
        : `${issueCountLabel(issues.length)} · ${draftCount === 1 ? '1 draft' : `${draftCount} drafts`}`
  const note =
    aiOffMessage ??
    (!draftingPages && issues.length > 0 && draftCount === 0
      ? 'Nothing stood out clearly enough to draft.'
      : null)
  return (
    <section aria-labelledby='retro-work-heading' aria-busy={drafting || draftingPages}>
      <div className='flex flex-col gap-1 px-4 pt-[18px]'>
        <div className='flex items-baseline justify-between gap-2'>
          <h3
            id='retro-work-heading'
            className='m-0 flex items-center gap-1.5 font-semibold text-fg-primary text-sm'
          >
            {!aiOffMessage && <AutoAwesome className='size-[18px] text-accent' />}
            {drafting ? 'Finding your work' : 'Your work'}
            {drafting && <Ellipsis />}
          </h3>
          {countLabel && <span className='shrink-0 text-fg-muted text-xs'>{countLabel}</span>}
        </div>
        {draftingPages && issues.length > 0 && (
          <p role='status' className='m-0 text-fg-muted text-xs'>
            Drafting reflections from your most notable work
            <Ellipsis />
          </p>
        )}
        {note && <p className='m-0 text-fg-muted text-xs'>{note}</p>}
      </div>
      <div className='flex flex-col px-4 pb-4'>
        {error && <div className='pt-2.5 text-fg-error text-sm'>{error}</div>}
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
