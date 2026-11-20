import {AutoAwesome} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import InspirationSourceLogo from './InspirationSourceLogo'
import inspirationKindLabel from './inspirationKindLabel'
import inspirationServiceLabel from './inspirationServiceLabel'
import retroDraftCardId from './retroDraftCardId'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  issue: InspirationDraft['issues'][number]
  // The draft above that was drawn from this issue, if any
  draftId: string | null
}

const RetroTimelineEvent = (props: Props) => {
  const {issue, draftId} = props
  const {service, kind, title, url} = issue
  const showDraft = () => {
    const card = draftId ? document.getElementById(retroDraftCardId(draftId)) : null
    card?.focus({preventScroll: true})
    card?.scrollIntoView({behavior: 'smooth', block: 'center'})
  }
  return (
    <li className='grid grid-cols-[16px_minmax(0,1fr)] gap-x-1.5 py-1.5'>
      <span
        aria-hidden
        className='before:-inset-y-1.5 relative flex justify-center before:absolute before:w-0.5 before:bg-hairline'
      >
        {draftId ? (
          <AutoAwesome className='relative mt-0.5 size-4 rounded-full bg-surface-drawer text-accent' />
        ) : (
          <span className='relative mt-[5px] size-2.5 rounded-full border-2 border-hairline-strong bg-surface-drawer' />
        )}
      </span>
      <div className='flex min-w-0 items-start gap-1.5'>
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
          <span className='text-fg-muted text-xs'>
            {inspirationKindLabel(kind)}
            {draftId && (
              <>
                {' · '}
                <Button variant='link' className='text-accent-strong text-xs' onClick={showDraft}>
                  In a draft above
                </Button>
              </>
            )}
          </span>
        </div>
      </div>
    </li>
  )
}

export default RetroTimelineEvent
