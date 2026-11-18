import dayjs from 'dayjs'
import {cn} from '../../../ui/cn'
import InspirationSourceLogo from './InspirationSourceLogo'
import inspirationServiceLabel from './inspirationServiceLabel'
import parseInspirationContent from './parseInspirationContent'
import RetroInspirationItemCard from './RetroInspirationItemCard'
import RetroStartReflectionMenu from './RetroStartReflectionMenu'
import reflectionStarterContent from './reflectionStarterContent'
import type {InspirationDraft} from './useInspirationDraft'
import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

interface Props {
  issue: InspirationDraft['issues'][number]
}

const toSentenceCase = (text: string) => text.charAt(0) + text.slice(1).toLowerCase()

const RetroTimelineEvent = (props: Props) => {
  const {issue} = props
  const {service, kind, title, url, updatedAt, draft} = issue
  const {meetingId} = useWorkDrawerConsume()
  return (
    <li className='group grid grid-cols-[44px_16px_minmax(0,1fr)] gap-x-1.5 py-1.5'>
      <span className='text-right text-fg-muted text-xs leading-5'>
        {updatedAt && dayjs(updatedAt).format('MMM D')}
      </span>
      <span
        aria-hidden
        className='before:-inset-y-1.5 relative flex justify-center before:absolute before:w-0.5 before:bg-hairline'
      >
        <span
          className={cn(
            'relative mt-[5px] size-2.5 rounded-full border-2',
            draft ? 'border-accent bg-accent' : 'border-hairline-strong bg-surface-card'
          )}
        />
      </span>
      <div className='flex min-w-0 flex-col gap-2'>
        <div className='flex items-start gap-1.5'>
          <span
            role='img'
            aria-label={inspirationServiceLabel(service)}
            title={inspirationServiceLabel(service)}
            className='mt-0.5 flex size-4 shrink-0 items-center justify-center [&>*]:size-full'
          >
            <InspirationSourceLogo service={service} />
          </span>
          <div className='flex min-w-0 flex-1 flex-col'>
            {url ? (
              <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='line-clamp-2 font-medium text-fg-primary text-sm leading-5 underline decoration-hairline-strong hover:decoration-fg-primary'
              >
                {title}
              </a>
            ) : (
              <span className='line-clamp-2 font-medium text-fg-primary text-sm leading-5'>
                {title}
              </span>
            )}
            <span className='text-fg-muted text-xs'>{toSentenceCase(kind)}</span>
          </div>
          <RetroStartReflectionMenu
            subject={title}
            content={reflectionStarterContent(title, url)}
            revealOnHover
          />
        </div>
        {draft && (
          <RetroInspirationItemCard
            key={draft.id}
            meetingId={meetingId}
            promptId={draft.promptId ?? null}
            title={null}
            content={parseInspirationContent(draft.content)}
          />
        )}
      </div>
    </li>
  )
}

export default RetroTimelineEvent
