import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'

export const TextCell = ({
  doc,
  rowId,
  columnId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
}) => {
  const [value, setValue] = useCell(doc, rowId, columnId)
  return (
    <Input
      value={value ?? ''}
      className='w-full border-none'
      onChange={(e) => {
        setValue(e.target.value || null)
      }}
    />
  )
}
