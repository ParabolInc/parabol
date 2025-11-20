import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'

export const NumberCell = ({
  doc,
  rowId,
  columnId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
}) => {
  const [rawValue, setRawValue] = useCell(doc, rowId, columnId)

  const convertToNumber = (rawValue: string | null) => {
    if (!rawValue) return ''
    const conv = parseInt(rawValue, 10)
    if (isNaN(conv)) return ''
    return conv.toString()
  }

  const value = convertToNumber(rawValue)

  return (
    <Input
      type='text'
      value={value}
      className='w-full border-none text-right'
      onChange={(e) => {
        const rawValue = e.target.value
        const value = convertToNumber(rawValue)
        setRawValue(value)
      }}
    />
  )
}
