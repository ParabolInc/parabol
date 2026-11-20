import {AutoAwesome} from '~/ui/icons'
import Ellipsis from '../../Ellipsis/Ellipsis'
import parseInspirationContent from './parseInspirationContent'
import RetroInspirationItemCard from './RetroInspirationItemCard'
import RetryableError from './RetryableError'
import type {InspirationDraft} from './useInspirationDraft'
import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

interface Props {
  draft: InspirationDraft | null
  drafting: boolean
  error: string | null
  onRetry: () => void
}

const RetroDraftSection = (props: Props) => {
  const {draft, drafting, error, onRetry} = props
  const {meetingId} = useWorkDrawerConsume()
  const items = drafting ? [] : (draft?.items ?? [])
  const isDrafted = !drafting && !error && !!draft && !draft.awaitingItems
  const {readCount = 0, issueCount = 0} = draft ?? {}
  const note = !isDrafted
    ? null
    : items.length === 0
      ? 'Nothing stood out clearly enough to draft.'
      : readCount < issueCount
        ? `Drafted from your ${readCount} most notable of ${issueCount} items`
        : null
  return (
    <section
      aria-labelledby='retro-drafts-heading'
      aria-busy={drafting}
      className='flex flex-col gap-1 px-4 pt-[18px]'
    >
      <div className='flex items-baseline justify-between gap-2'>
        <h3
          id='retro-drafts-heading'
          className='m-0 flex items-center gap-1.5 font-semibold text-fg-primary text-sm'
        >
          <AutoAwesome className='size-[18px] text-accent' />
          Worth raising
        </h3>
        {items.length > 0 && (
          <span className='shrink-0 text-fg-muted text-xs'>
            {items.length === 1 ? '1 draft' : `${items.length} drafts`}
          </span>
        )}
      </div>
      {drafting && (
        <p role='status' className='m-0 text-fg-muted text-xs'>
          Looking for themes across your work
          <Ellipsis />
        </p>
      )}
      {note && <p className='m-0 text-fg-muted text-xs'>{note}</p>}
      {error && <RetryableError message={error} onRetry={onRetry} className='pt-1.5' />}
      {items.length > 0 && (
        <div className='flex flex-col gap-2 pt-1.5'>
          {items.map(({id, content, promptId, issues}) => (
            <RetroInspirationItemCard
              key={id}
              meetingId={meetingId}
              promptId={promptId}
              title={null}
              content={parseInspirationContent(content)}
              issues={issues}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default RetroDraftSection
