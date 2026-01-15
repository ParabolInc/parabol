import {HocuspocusProvider} from '@hocuspocus/provider'
import {useRef} from 'react'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'
import {useFocus} from './useFocus'

export const NumberCell = ({
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

  const ref = useRef<HTMLInputElement>(null)
  const {focusProps, focusCell} = useFocus({
    provider,
    key: `${columnId}:${rowId}`,
    onStartEditing: () => {
      ref.current?.focus()
    },
    onStopEditing: () => {
      focusCell()
    }
  })

  const convertToNumber = (rawValue: string | null) => {
    if (!rawValue) return ''
    const conv = parseInt(rawValue, 10)
    if (isNaN(conv)) return ''
    return conv.toString()
  }

  const value = convertToNumber(rawValue)

  return (
    <div
      {...focusProps}
      className='h-full w-full border-none focus-within:outline-3 focus-within:outline-sky-500 focus:outline-2 focus:outline-sky-400'
    >
      <Input
        ref={ref}
        type='text'
        value={value}
        className='w-full border-none text-right'
        onChange={(e) => {
          const rawValue = e.target.value
          const value = convertToNumber(rawValue)
          setRawValue(value)
        }}
      />
    </div>
  )
}
