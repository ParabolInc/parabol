import {HocuspocusProvider} from '@hocuspocus/provider'
import * as Popover from '@radix-ui/react-popover'
import {useMemo, useState} from 'react'
import * as Y from 'yjs'
import {cn} from '../../../ui/cn'
import {cellClassName} from './cellClassName'
import {ColumnId, RowId} from './data'
import {useCell, useColumnValues} from './hooks'
import {StatusPicker} from './StatusPicker'
import {Tag} from './Tag'
import {useFocus} from './useFocus'

const useStatusType = ({doc, columnId}: {doc: Y.Doc; columnId: ColumnId}) => {
  const columnValues = useColumnValues(doc, columnId)

  const options = useMemo(() => {
    return Array.from(columnValues).sort()
  }, [columnValues])

  return options as string[]
}

export const StatusCell = ({
  provider,
  rowId,
  columnId
}: {
  provider: HocuspocusProvider
  rowId: RowId
  columnId: ColumnId
}) => {
  const {document: doc} = provider
  const [value, setValue] = useCell(doc, rowId, columnId)
  const tags = useStatusType({doc, columnId})

  const [isOpen, setIsOpen] = useState(false)

  const {focusProps} = useFocus({
    provider,
    key: `${columnId}:${rowId}`,
    onStartEditing: () => {
      setIsOpen(true)
    },
    onStopEditing: () => {
      setIsOpen(false)
    }
  })

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          {...focusProps}
          className={cn(cellClassName, 'cursor-pointer px-3 data-[state=open]:outline-2')}
          onClick={() => {
            setIsOpen(true)
          }}
        >
          {value && <Tag label={value} />}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <StatusPicker value={value} setValue={setValue} tags={tags} />
      </Popover.Portal>
    </Popover.Root>
  )
}
