import {DeleteForever as DeleteForeverIcon, type IconComponent, Undo as UndoIcon} from '~/ui/icons'
import {ArchivedPagesButton} from './ArchivedPagesButton'

interface Props {
  pageId: string
  title: string
  Icon: IconComponent
  subline: string | null
  restoreBlockedBy: string | null
  onRestore: (pageId: string) => void
  onDelete: (pageId: string) => void
}

export const ArchivedPageRow = (props: Props) => {
  const {pageId, title, Icon, subline, restoreBlockedBy, onRestore, onDelete} = props
  return (
    <div className='flex items-center justify-between'>
      <div className='flex w-full items-center rounded-md pr-2 pl-1 hover:bg-surface-hover'>
        <Icon className='mr-0.5 size-4' />
        <div className='flex grow flex-col'>
          <div className='font-medium text-fg-primary text-sm'>{title || '<Untitled>'}</div>
          {subline && <div className='text-fg-secondary text-xs'>{subline}</div>}
        </div>
        <div className='flex items-center justify-end space-x-1'>
          <ArchivedPagesButton
            Icon={UndoIcon}
            tooltip={restoreBlockedBy === null ? 'Restore' : `Restore ${restoreBlockedBy} first`}
            disabled={restoreBlockedBy !== null}
            onClick={(e) => {
              e.preventDefault()
              onRestore(pageId)
            }}
          />
          <ArchivedPagesButton
            Icon={DeleteForeverIcon}
            tooltip='Permanently Delete'
            onClick={(e) => {
              e.preventDefault()
              onDelete(pageId)
            }}
          />
        </div>
      </div>
    </div>
  )
}
