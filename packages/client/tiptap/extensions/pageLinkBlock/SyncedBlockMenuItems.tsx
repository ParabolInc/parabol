import {type ComponentType, Fragment} from 'react'
import {AddToPhotos, ContentCopy, DeleteOutlined, Edit, NorthEast} from '~/ui/icons'
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
  duplicatePlain: {Icon: AddToPhotos, label: 'Duplicate as plain blocks', hint: `${modKey}+D`},
  deleteFromPage: {Icon: DeleteOutlined, label: 'Delete from this page', hint: 'Del'}
}

export const SyncedBlockMenuItems = ({rows, actions}: Props) =>
  rows.map((row) => {
    const {Icon, label, hint} = rowLooks[row]
    return (
      <Fragment key={row}>
        {row === 'deleteFromPage' && <MenuSeparator />}
        <MenuItem onSelect={actions[row]}>
          <Icon className={MENU_ITEM_ICON} />
          <span className='flex-1 text-left'>{label}</span>
          {hint && <span className='ml-4 text-fg-muted text-xs'>{hint}</span>}
        </MenuItem>
      </Fragment>
    )
  })
