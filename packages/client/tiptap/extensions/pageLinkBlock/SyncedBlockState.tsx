import {ErrorOutline} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {SyncedBlockLockedPanel} from './SyncedBlockLockedPanel'
import {SyncedBlockPanel} from './SyncedBlockPanel'

interface Props {
  status: 'loading' | 'locked' | 'error'
  pageCode: number
  onRetry: () => void
}

const SKELETON_LINE_WIDTH_CLASSES = ['w-[62%]', 'w-[70%]', 'w-[54%]']

export const SyncedBlockState = (props: Props) => {
  const {status, pageCode, onRetry} = props
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
  if (status === 'locked') return <SyncedBlockLockedPanel pageCode={pageCode} />
  return (
    <SyncedBlockPanel
      icon={ErrorOutline}
      action={
        <Button variant='outline' size='sm' onClick={onRetry}>
          Try again
        </Button>
      }
    >
      This synced block didn't load.
    </SyncedBlockPanel>
  )
}
