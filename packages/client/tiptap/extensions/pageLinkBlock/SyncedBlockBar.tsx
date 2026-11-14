import type {ReactNode} from 'react'
import {Autorenew, ContentCopy} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {SyncedBlockTag} from './SyncedBlockTag'
import {syncedBlockBarButtonClass} from './syncedBlockBarButtonClass'

interface Props {
  name: string
  isOriginal: boolean
  isViewOnly: boolean
  places: ReactNode
  more: ReactNode | null
  renameInput?: ReactNode
  onStartRename?: () => void
  onCopy: () => void
}

export const SyncedBlockBar = (props: Props) => {
  const {name, isOriginal, isViewOnly, places, more, renameInput, onStartRename, onCopy} = props
  return (
    <div
      data-synced-chrome
      contentEditable={false}
      className={cn(
        'absolute right-[-2px] bottom-[calc(100%+2px)] left-[-2px] flex h-7 select-none items-center gap-2 whitespace-nowrap rounded-t-md pr-1 @min-[852px]/page:pl-[34px] pl-2.5 text-xs',
        isViewOnly
          ? 'bg-surface-raised text-fg-secondary shadow-[inset_0_0_0_1px_var(--color-hairline-strong)]'
          : 'bg-accent-active text-white dark:text-grape-950'
      )}
    >
      <Autorenew className='text-[14px]' />
      {renameInput ??
        (onStartRename && !isViewOnly ? (
          <button
            type='button'
            onClick={onStartRename}
            className='min-w-[72px] shrink cursor-text truncate border-0 bg-transparent p-0 text-left font-semibold text-inherit text-xs'
          >
            {name || 'Synced block'}
          </button>
        ) : (
          <span className='min-w-[72px] shrink truncate font-semibold'>
            {name || 'Synced block'}
          </span>
        ))}
      {isOriginal && !isViewOnly && <SyncedBlockTag>Original</SyncedBlockTag>}
      {isViewOnly && <span>View only</span>}
      {!renameInput && <span className='flex-auto' />}
      {places}
      <Button onClick={onCopy} className={syncedBlockBarButtonClass(isViewOnly)}>
        <ContentCopy className='text-[14px]' />
        <span>Copy and sync</span>
      </Button>
      {more}
    </div>
  )
}
