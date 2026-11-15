import {ErrorOutline, Lock} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'

interface Props {
  status: 'loading' | 'locked' | 'error'
  onRetry: () => void
}

const SKELETON_LINE_WIDTH_CLASSES = ['w-[62%]', 'w-[70%]', 'w-[54%]']

export const SyncedBlockState = (props: Props) => {
  const {status, onRetry} = props
  if (status === 'loading') {
    return (
      <div
        role='status'
        aria-label='Loading synced block'
        contentEditable={false}
        className='flex flex-col gap-2 py-1'
      >
        {SKELETON_LINE_WIDTH_CLASSES.map((widthClass) => (
          <div key={widthClass} className={`h-3 rounded-sm bg-surface-hover ${widthClass}`} />
        ))}
      </div>
    )
  }
  const Icon = status === 'locked' ? Lock : ErrorOutline
  return (
    <div
      data-synced-chrome
      contentEditable={false}
      className='flex min-h-6 items-center gap-2 text-fg-secondary text-sm'
    >
      <Icon className='text-[20px] text-fg-muted' />
      <span>
        {status === 'locked'
          ? "You don't have access to this synced block."
          : "This synced block didn't load."}
      </span>
      {status === 'error' && (
        <Button variant='outline' size='sm' onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
