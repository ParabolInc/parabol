import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'

export const CheckCell = ({
  doc,
  rowId,
  columnId,
  userId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
  userId?: string
}) => {
  const [rawValue, setRawValue] = useCell(doc, rowId, columnId, userId)
  const checked = rawValue === 'true'
  return (
    <Input
      type='checkbox'
      checked={checked}
      className='mx-2.5 h-4.5 w-4.5 border-none'
      onChange={(e) => {
        setRawValue(e.target.checked ? 'true' : 'false')
      }}
    />
  )
}
