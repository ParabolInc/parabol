import {Description, Lock, RemoveCircleOutline} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import type {SyncedBlockDialogRowIcon} from './getSyncedBlockDialogRows'
import {SyncedBlockTag} from './SyncedBlockTag'

const ICONS = {page: Description, removed: RemoveCircleOutline, locked: Lock}

interface Props {
  icon: SyncedBlockDialogRowIcon
  title: string
  note?: string
  isThisPage: boolean
}

export const SyncedBlockDialogRow = ({icon, title, note, isThisPage}: Props) => {
  const Icon = ICONS[icon]
  return (
    <div className='flex items-center gap-2.5 border-hairline border-t px-3 py-2 first:border-t-0'>
      <Icon className='shrink-0 text-[18px] text-fg-secondary' />
      <span className='min-w-0 flex-auto'>
        <span className={cn('block truncate text-sm', icon === 'locked' && 'text-fg-secondary')}>
          {title}
        </span>
        {note && <span className='block text-fg-secondary text-xs'>{note}</span>}
      </span>
      {isThisPage && <SyncedBlockTag className='text-fg-secondary'>This page</SyncedBlockTag>}
    </div>
  )
}
