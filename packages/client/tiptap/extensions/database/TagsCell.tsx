import {HocuspocusProvider} from '@hocuspocus/provider'
import * as Popover from '@radix-ui/react-popover'
import {useMemo, useState} from 'react'
import * as Y from 'yjs'
import {cn} from '../../../ui/cn'
import {cellClassName} from './cellClassName'
import {ColumnId, RowId} from './data'
import {useCell, useColumnValues} from './hooks'
import {Tag} from './Tag'
import {TagsPicker} from './TagsPicker'
import {useFocus} from './useFocus'

const useTagsType = ({doc, columnId}: {doc: Y.Doc; columnId: ColumnId}) => {
  const columnValues = useColumnValues(doc, columnId)

  const options = useMemo(() => {
    return Array.from(
      new Set(
        Array.from(columnValues)
          .flatMap((value) => value?.split(',').map((s) => s.trim()))
          .filter(Boolean)
      )
    ).sort() as string[]
  }, [columnValues])

  return options
}

export const TagsCell = ({
  provider,
  rowId,
  columnId
}: {
  provider: HocuspocusProvider
  rowId: RowId
  columnId: ColumnId
}) => {
  const {document: doc} = provider
  const [rawValue, setRawValue] = useCell(doc, rowId, columnId)
  const tags = useTagsType({doc, columnId})

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

  const values =
    rawValue
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []

  const setValues = (newValues: string[]) => {
    setRawValue(newValues.join(', '))
  }

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          {...focusProps}
          className={cn(
            cellClassName,
            'cursor-pointer gap-1 overflow-hidden px-3 data-[state=open]:outline-2'
          )}
          onClick={() => {
            setIsOpen(true)
          }}
        >
          {values.map((value) => (
            <Tag key={value} label={value} />
          ))}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <TagsPicker values={values} setValues={setValues} tags={tags} />
      </Popover.Portal>
    </Popover.Root>
  )
}
