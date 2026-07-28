import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ScheduleIcon from '@mui/icons-material/Schedule'

export type ExportPage = {
  readonly pageId: string
  readonly title: string
  readonly depth: number
  readonly status: string
  readonly targetUrl: string | null | undefined
  readonly error: string | null | undefined
}

interface Props {
  page: ExportPage
  onRetry?: (pageId: string) => void
}

const STATUS_ICONS = {
  pending: <ScheduleIcon className='size-4 text-fg-muted' />,
  exporting: <AutorenewIcon className='size-4 animate-spin text-accent' />,
  success: <CheckCircleIcon className='size-4 text-jade-500' />,
  error: <ErrorOutlineIcon className='size-4 text-tomato-500' />,
  skipped: <RemoveCircleOutlineIcon className='size-4 text-fg-muted' />
} as Record<string, React.ReactNode>

export const PageExportRow = (props: Props) => {
  const {page, onRetry} = props
  const {pageId, title, depth, status, targetUrl, error} = page
  return (
    <div className='flex items-center gap-2 py-1 text-sm' style={{paddingLeft: `${depth * 16}px`}}>
      {STATUS_ICONS[status] ?? STATUS_ICONS['pending']}
      {status === 'success' && targetUrl ? (
        <a
          href={targetUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='truncate text-fg-primary hover:text-accent'
        >
          {title}
        </a>
      ) : (
        <span className='truncate text-fg-primary'>{title}</span>
      )}
      {error && <span className='truncate text-fg-muted text-xs'>{error}</span>}
      {status === 'error' && onRetry && (
        <button
          type='button'
          className='cursor-pointer border-none bg-transparent p-0 font-semibold text-accent text-xs hover:underline'
          onClick={() => onRetry(pageId)}
        >
          Retry
        </button>
      )}
    </div>
  )
}
