import {
  Check,
  ChevronRight,
  ContentCopy,
  DeleteOutline,
  FirstPage,
  LastPage,
  Notes,
  SwapHoriz
} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {FormEvent} from 'react'
import * as Y from 'yjs'
import useForm from '../../../hooks/useForm'
import {Input} from '../../../ui/Input/Input'
import {
  ColumnId,
  ColumnMeta,
  changeColumn,
  deleteColumn,
  duplicateColumn,
  insertColumnAt
} from './data'
import {DataType, DataTypeIcons} from './types'

export const Header = (props: {columnMeta: ColumnMeta; doc: Y.Doc; columnId: ColumnId}) => {
  const {doc, columnId, columnMeta} = props

  const {name, type} = columnMeta
  const changeType = (newType: string) => {
    changeColumn(doc, columnId, {name, type: newType as DataType})
  }
  const changeTitle = (newTitle: string) => {
    changeColumn(doc, columnId, {name: newTitle, type})
  }

  const {fields, onChange} = useForm({
    newTitle: {
      getDefault: () => name
    }
  })

  const handleChangeTitle = (e: FormEvent) => {
    e.preventDefault()
    changeTitle(fields.newTitle.value)
    fields.newTitle.resetValue()
  }

  const dataActions = [
    {
      label: 'Insert left',
      icon: <FirstPage />,
      action: () => {
        const columns = doc.getArray<ColumnId>('columns')
        const index = columns.toArray().indexOf(columnId)
        insertColumnAt(doc, index)
      }
    },
    {
      label: 'Insert right',
      icon: <LastPage />,
      action: () => {
        const columns = doc.getArray<ColumnId>('columns')
        const index = columns.toArray().indexOf(columnId)
        insertColumnAt(doc, index + 1)
      }
    },
    {
      label: 'Duplicate property',
      icon: <ContentCopy />,
      action: () => {
        duplicateColumn(doc, columnId)
      }
    },
    {
      label: 'Delete property',
      icon: <DeleteOutline />,
      action: () => {
        deleteColumn(doc, columnId)
      }
    }
  ]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className='items-cursor-pointer flex w-full items-center gap-2 p-2 hover:bg-slate-100'>
          {DataTypeIcons[type as DataType] || <Notes />}
          <span className='truncate'>{name}</span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          className='bg-white p-2 text-slate-800'
          align='start'
          collisionPadding={8}
        >
          <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
            <form onSubmit={handleChangeTitle}>
              <Input
                className='mb-2 w-full border-slate-300 border-b pb-1'
                name='newTitle'
                defaultValue={name}
                onChange={onChange}
              />
            </form>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-100'>
                <SwapHoriz />
                Change type
                <ChevronRight className='ml-auto' />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent className='min-w-[200px] bg-white p-2 text-slate-800'>
                  <DropdownMenu.RadioGroup value={type} onValueChange={changeType}>
                    {Object.entries(DataTypeIcons).map(([type, icon]) => (
                      <DropdownMenu.RadioItem
                        key={type}
                        value={type}
                        className='group flex cursor-pointer items-center gap-2 rounded-md p-2 capitalize hover:bg-slate-100'
                      >
                        {icon}
                        {type}
                        <Check className='ml-auto hidden group-data-[state=checked]:inline' />
                      </DropdownMenu.RadioItem>
                    ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator className='my-1 h-px bg-slate-200' />
            {dataActions.map(({label, icon, action}) => (
              <DropdownMenu.Item
                key={label}
                className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-100'
                onSelect={action}
              >
                {icon}
                {label}
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
