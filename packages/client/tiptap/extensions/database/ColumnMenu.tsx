import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Y from 'yjs'
import {ContentCopy, DeleteOutline, FirstPage, LastPage, SwapHoriz} from '~/ui/icons'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {DATABASE_COLUMN_NAME_MAX_CHARS} from '../../../utils/constants'
import {DropdownMenuInputItem} from './DropdownMenuInputItem'
import {
  ColumnId,
  deleteColumn,
  duplicateColumn,
  insertColumnAfter,
  insertColumnBefore
} from './data'
import {DataType, DataTypeIcons} from './types'

type Props = {
  doc: Y.Doc
  columnId: ColumnId
  name: string
  type: DataType
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onNameSubmit: () => void
  onTypeChange: (newType: string) => void
  onCloseAutoFocus: (e: Event) => void
}

export const ColumnMenu = (props: Props) => {
  const {doc, columnId, name, type, onNameChange, onNameSubmit, onTypeChange, onCloseAutoFocus} =
    props

  const dataActions = [
    {label: 'Insert left', Icon: FirstPage, action: () => insertColumnBefore(doc, columnId)},
    {label: 'Insert right', Icon: LastPage, action: () => insertColumnAfter(doc, columnId)},
    {label: 'Duplicate property', Icon: ContentCopy, action: () => duplicateColumn(doc, columnId)},
    {label: 'Delete property', Icon: DeleteOutline, action: () => deleteColumn(doc, columnId)}
  ]

  return (
    <MenuContent
      align='start'
      sideOffset={4}
      collisionPadding={8}
      className='max-h-80 w-56'
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <form
        className='px-2 pt-1 pb-2'
        onSubmit={(e) => {
          e.preventDefault()
          onNameSubmit()
        }}
      >
        <DropdownMenuInputItem
          name='newTitle'
          aria-label='Column name'
          defaultValue={name}
          onChange={onNameChange}
          maxLength={DATABASE_COLUMN_NAME_MAX_CHARS}
        />
      </form>
      <DropdownMenu.Sub>
        <MenuSubTrigger>
          <SwapHoriz className={MENU_ITEM_ICON} />
          Change type
        </MenuSubTrigger>
        <MenuSubContent>
          <DropdownMenu.RadioGroup value={type} onValueChange={onTypeChange}>
            {Object.entries(DataTypeIcons).map(([dataType, Icon]) => (
              <MenuRadioItem key={dataType} value={dataType} className='capitalize'>
                <Icon className={MENU_ITEM_ICON} />
                {dataType}
              </MenuRadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </MenuSubContent>
      </DropdownMenu.Sub>
      <MenuSeparator />
      {dataActions.map(({label, Icon, action}) => (
        <MenuItem key={label} onSelect={action}>
          <Icon className={MENU_ITEM_ICON} />
          {label}
        </MenuItem>
      ))}
    </MenuContent>
  )
}
