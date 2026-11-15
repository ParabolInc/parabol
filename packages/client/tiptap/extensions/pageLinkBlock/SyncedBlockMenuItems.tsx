import {type ComponentType, Fragment} from 'react'
import {
  AddToPhotos,
  CallSplit,
  ContentCopy,
  DeleteForever,
  DeleteOutlined,
  Edit,
  Group,
  NorthEast
} from '~/ui/icons'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {modKey} from '../../../utils/platform'
import type {SyncedBlockMenuRow} from './getSyncedBlockMenuRows'

interface Props {
  rows: SyncedBlockMenuRow[]
  actions: Record<SyncedBlockMenuRow, () => void>
}

const rowLooks: Record<
  SyncedBlockMenuRow,
  {Icon: ComponentType<{className?: string}>; label: string; hint?: string}
> = {
  copyAndSync: {Icon: ContentCopy, label: 'Copy and sync'},
  goToOriginal: {Icon: NorthEast, label: 'Go to original'},
  rename: {Icon: Edit, label: 'Rename'},
  whoHasAccess: {Icon: Group, label: 'Who has access'},
  duplicatePlain: {Icon: AddToPhotos, label: 'Duplicate as plain blocks', hint: `${modKey}+D`},
  unsyncCopy: {Icon: CallSplit, label: 'Unsync this copy'},
  unsyncAll: {Icon: CallSplit, label: 'Unsync all'},
  deleteFromPage: {Icon: DeleteOutlined, label: 'Delete from this page', hint: 'Del'},
  deleteAll: {Icon: DeleteForever, label: 'Delete all'}
}

const separatedRows: SyncedBlockMenuRow[] = ['unsyncCopy', 'unsyncAll', 'deleteFromPage']

export const SyncedBlockMenuItems = ({rows, actions}: Props) => {
  const firstSeparated = rows.find((row) => separatedRows.includes(row))
  return rows.map((row) => {
    const {Icon, label, hint} = rowLooks[row]
    return (
      <Fragment key={row}>
        {row === firstSeparated && <MenuSeparator />}
        <MenuItem onSelect={actions[row]}>
          <Icon className={MENU_ITEM_ICON} />
          <span className='flex-1 text-left'>{label}</span>
          {hint && <span className='ml-4 text-fg-muted text-xs'>{hint}</span>}
        </MenuItem>
      </Fragment>
    )
  })
}
