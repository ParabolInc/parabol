import {Description} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import type {SyncedBlockDialogRowIcon} from './getSyncedBlockDialogRows'
import {SyncedBlockDialogRow} from './SyncedBlockDialogRow'

const SKELETON_WIDTHS = ['w-[58%]', 'w-[44%]', 'w-[51%]']
const SCROLL_AFTER = 5

interface Props {
  rows:
    | {
        key: string
        icon: SyncedBlockDialogRowIcon
        title: string
        note?: string
        isThisPage: boolean
      }[]
    | null
  hasNotes?: boolean
}

export const SyncedBlockDialogRows = ({rows, hasNotes}: Props) => (
  <div
    aria-busy={!rows}
    className={cn(
      'rounded-md border border-hairline',
      rows && rows.length > SCROLL_AFTER && 'max-h-[232px] overflow-y-auto'
    )}
  >
    {rows
      ? rows.map(({key, ...row}) => <SyncedBlockDialogRow key={key} {...row} />)
      : SKELETON_WIDTHS.map((width) => (
          <div
            key={width}
            aria-hidden='true'
            className='flex items-center gap-2.5 border-hairline border-t px-3 py-2 first:border-t-0'
          >
            <Description className='shrink-0 text-[18px] text-fg-secondary' />
            <span className='min-w-0 flex-auto'>
              <span className='flex h-5 items-center'>
                <span className={cn('h-3 animate-pulse rounded-sm bg-surface-hover', width)} />
              </span>
              {hasNotes && (
                <span className='flex h-4 items-center'>
                  <span className='h-2.5 w-[30%] animate-pulse rounded-sm bg-surface-hover' />
                </span>
              )}
            </span>
          </div>
        ))}
  </div>
)
