import {HocuspocusProvider} from '@hocuspocus/provider'
import {useRef} from 'react'
import {cn} from '../../../ui/cn'
import {Input} from '../../../ui/Input/Input'
import {cellClassName, cellInputClassName} from './cellClassName'
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
    <div {...focusProps} className={cellClassName}>
      <Input
        ref={ref}
        type='text'
        inputMode='numeric'
        value={value}
        className={cn(cellInputClassName, 'text-right tabular-nums')}
        onChange={(e) => {
          const rawValue = e.target.value
          const value = convertToNumber(rawValue)
          setRawValue(value)
        }}
      />
    </div>
  )
}
