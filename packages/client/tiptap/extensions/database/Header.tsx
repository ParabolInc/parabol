import {HocuspocusProvider} from '@hocuspocus/provider'
import {useEffect, useRef, useState} from 'react'
import {Notes} from '~/ui/icons'
import useForm from '../../../hooks/useForm'
import {Menu} from '../../../ui/Menu/Menu'
import {ColumnMenu} from './ColumnMenu'
import {ColumnId, changeColumn, getColumnMeta} from './data'
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

  const [menuOpen, setMenuOpen] = useState(false)
  const onOpenChange = (open: boolean) => {
    if (!open) {
      handleChangeTitle()
    }
    setMenuOpen(open)
  }

  // a pointer user never asked for focus, so handing it back on close would leave a stray focus ring on the header
  const openedByPointerRef = useRef(false)
  const onCloseAutoFocus = (e: Event) => {
    if (!openedByPointerRef.current) return
    openedByPointerRef.current = false
    e.preventDefault()
  }

  const TypeIcon = DataTypeIcons[type] ?? Notes

  return (
    <Menu
      open={menuOpen}
      onOpenChange={onOpenChange}
      trigger={
        <button
          {...focusProps}
          onPointerDown={() => {
            openedByPointerRef.current = true
          }}
          className='-outline-offset-2 flex h-full w-full cursor-pointer items-center gap-1.5 px-3 text-left font-medium outline-accent hover:bg-surface-hover focus-visible:outline-2 data-[state=open]:bg-surface-hover'
        >
          <TypeIcon className='text-[16px] text-fg-muted' />
          <span className='truncate'>{name}</span>
        </button>
      }
    >
      <ColumnMenu
        doc={doc}
        columnId={columnId}
        name={name}
        type={type}
        onNameChange={onChange}
        onNameSubmit={handleChangeTitle}
        onTypeChange={changeType}
        onCloseAutoFocus={onCloseAutoFocus}
      />
    </Menu>
  )
}
