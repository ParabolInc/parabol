import {AutoAwesome} from '~/ui/icons'
import InspirationSourceLogo from './InspirationSourceLogo'
import inspirationKindLabel from './inspirationKindLabel'
import inspirationServiceLabel from './inspirationServiceLabel'
import type {InspirationDraft} from './useInspirationDraft'

interface Props {
  issue: InspirationDraft['issues'][number]
  // A draft above was drawn from this issue
  isDrafted: boolean
}

const RetroTimelineEvent = (props: Props) => {
  const {issue, isDrafted} = props
  const {service, kind, title, url} = issue
  return (
    <li className='grid grid-cols-[16px_minmax(0,1fr)] gap-x-1.5 py-1.5'>
      <span
        aria-hidden
        className='before:-inset-y-1.5 relative flex justify-center before:absolute before:w-0.5 before:bg-hairline'
      >
        {isDrafted ? (
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
            {isDrafted && ' · In a draft above'}
          </span>
        </div>
      </div>
    </li>
  )
}

export default RetroTimelineEvent
