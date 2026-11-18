import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type * as React from 'react'
import {Description, Lock, Storage} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {MENU_ITEM, MENU_ITEM_ICON} from '../../../ui/Menu/MenuItem'
import type {MoveTargetRow} from '../../blockMove/getMoveTargetRows'

interface Props {
  row: MoveTargetRow
  onPick: (pageId: string, title: string) => void
}

const keepFocusOffRows = (e: React.PointerEvent<HTMLDivElement>) => {
  const focused = e.currentTarget.ownerDocument.activeElement
  if (focused?.getAttribute('role') !== 'menuitem') e.preventDefault()
}

const MoveToPageMenuItem = ({row, onPick}: Props) => {
  const {pageId, title, path, refusal, isDatabase} = row
  const Icon = isDatabase ? Storage : refusal === 'View only' ? Lock : Description
  return (
    <DropdownMenu.Item
      disabled={!!refusal}
      onSelect={() => onPick(pageId, title)}
      onPointerLeave={keepFocusOffRows}
      onPointerMove={refusal ? keepFocusOffRows : undefined}
      className={cn(
        MENU_ITEM,
        'cursor-pointer data-disabled:cursor-not-allowed data-disabled:hover:bg-transparent'
      )}
    >
      <Icon className={cn(MENU_ITEM_ICON, 'shrink-0', refusal && 'opacity-50')} />
      <div className='min-w-0 grow'>
        <div className={cn('truncate', refusal && 'opacity-50')}>{title}</div>
        <div className='truncate text-fg-muted text-xs'>{refusal ?? path}</div>
      </div>
    </DropdownMenu.Item>
  )
}

export default MoveToPageMenuItem
