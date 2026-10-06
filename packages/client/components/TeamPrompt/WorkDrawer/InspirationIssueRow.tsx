import dayjs from 'dayjs'
import InspirationSourceLogo from './InspirationSourceLogo'
import {serviceLabel} from './inspirationCopy'

interface Props {
  service: string
  title: string
  url?: string | null
  updatedAt?: string | null
  detail?: string
}

const InspirationIssueRow = (props: Props) => {
  const {service, title, url, updatedAt, detail} = props
  const date = updatedAt ? dayjs(updatedAt).format('MMM D') : null
  const meta = [date, detail].filter(Boolean).join(' · ')
  return (
    <li className='flex items-start gap-2 border-hairline border-b px-1 py-2 last:border-b-0'>
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
        {meta && <span className='text-fg-muted text-xs'>{meta}</span>}
      </div>
    </li>
  )
}

export default InspirationIssueRow
