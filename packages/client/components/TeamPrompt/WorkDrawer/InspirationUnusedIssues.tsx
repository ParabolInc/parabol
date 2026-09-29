import dayjs from 'dayjs'
import {useState} from 'react'
import {KeyboardArrowDown, KeyboardArrowRight} from '~/ui/icons'
import InspirationSourceLogo from './InspirationSourceLogo'
import {serviceLabel} from './inspirationCopy'
import sortInspirationIssues from './sortInspirationIssues'

interface Props {
  issues: readonly {
    service: string
    title: string
    url?: string | null
    updatedAt?: string | null
    reason: string
  }[]
}

const InspirationUnusedIssues = ({issues}: Props) => {
  const [expanded, setExpanded] = useState(false)
  if (issues.length === 0) return null
  const Arrow = expanded ? KeyboardArrowDown : KeyboardArrowRight
  return (
    <div className='flex flex-col'>
      <button
        type='button'
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className='flex h-9 cursor-pointer items-center gap-1 rounded-md px-1 font-semibold text-fg-secondary text-sm hover:bg-surface-hover'
      >
        <Arrow className='size-5' />
        Not in the draft ({issues.length})
      </button>
      {expanded && (
        <ul className='m-0 flex list-none flex-col p-0'>
          {sortInspirationIssues(issues).map(({service, title, url, updatedAt, reason}) => (
            <li
              key={`${service}:${url ?? title}`}
              className='flex items-start gap-2 border-hairline border-b px-1 py-2 last:border-b-0'
            >
              <span
                role='img'
                aria-label={serviceLabel(service)}
                title={serviceLabel(service)}
                className='mt-0.5 flex size-4 shrink-0 items-center justify-center [&>*]:size-full'
              >
                <InspirationSourceLogo service={service} />
              </span>
              <div className='flex min-w-0 flex-col gap-0.5'>
                {url ? (
                  <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='truncate font-medium text-fg-primary text-sm underline decoration-hairline-strong hover:decoration-fg-primary'
                  >
                    {title}
                  </a>
                ) : (
                  <span className='truncate font-medium text-fg-primary text-sm'>{title}</span>
                )}
                <span className='text-fg-muted text-xs'>
                  {updatedAt && `${dayjs(updatedAt).format('MMM D')} · `}
                  {reason}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default InspirationUnusedIssues
