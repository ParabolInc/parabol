import {HocuspocusProvider} from '@hocuspocus/provider'
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
import {useEffect, useState} from 'react'
import useForm from '../../../hooks/useForm'
import {DATABASE_COLUMN_NAME_MAX_CHARS} from '../../../utils/constants'
import {DropdownMenuInputItem} from './DropdownMenuInputItem'
import {
  ColumnId,
  changeColumn,
  deleteColumn,
  duplicateColumn,
  getColumnMeta,
  insertColumnAfter,
  insertColumnBefore
} from './data'
import {DataType, DataTypeIcons} from './types'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
  columnId: ColumnId
}
export const Header = (props: Props) => {
  const {provider, columnId} = props
  const {document: doc} = provider

  const {focusProps} = useFocus({provider, key: columnId})

  const columnMetaMap = getColumnMeta(doc)
  const [name, setName] = useState(columnMetaMap.get(columnId)?.name ?? 'Untitled')
  const [type, setType] = useState<DataType>(columnMetaMap.get(columnId)?.type ?? 'text')

  useEffect(() => {
    const updateMeta = () => {
      const meta = columnMetaMap.get(columnId)
      setName(meta?.name ?? 'Untitled')
      setType(meta?.type ?? 'text')
    }

    columnMetaMap.observe(updateMeta)
    updateMeta()

    return () => {
      columnMetaMap.unobserve(updateMeta)
    }
  }, [columnMetaMap, columnId])

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

  const handleChangeTitle = () => {
    if (!fields.newTitle.value || fields.newTitle.value === name) {
      return
    }
    changeTitle(fields.newTitle.value)
    fields.newTitle.resetValue()
  }

  const dataActions = [
    {
      label: 'Insert left',
      icon: <FirstPage />,
      action: () => {
        insertColumnBefore(doc, columnId)
      }
    },
    {
      label: 'Insert right',
      icon: <LastPage />,
      action: () => {
        insertColumnAfter(doc, columnId)
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

  const [menuOpen, setMenuOpen] = useState(false)
  const onOpenChange = (open: boolean) => {
    if (!open) {
      handleChangeTitle()
    }
    setMenuOpen(open)
  }

  return (
    <DropdownMenu.Root open={menuOpen} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild {...focusProps}>
        <button className='items-cursor-pointer flex h-full w-full items-center gap-2 p-2 hover:bg-slate-100 focus:outline-2 focus:outline-sky-400'>
          {DataTypeIcons[type as DataType] || <Notes />}
          <span className='truncate'>{name}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          className='bg-white p-2 text-slate-800'
          align='start'
          collisionPadding={8}
        >
          <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleChangeTitle()
              }}
            >
              <DropdownMenuInputItem
                className='mb-2 w-full border-slate-300 border-b pb-1'
                name='newTitle'
                defaultValue={name}
                onChange={onChange}
                maxLength={DATABASE_COLUMN_NAME_MAX_CHARS}
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
