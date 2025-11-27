import * as Y from 'yjs'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'

export const MetaCell = ({
  doc,
  rowId,
  columnId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
}) => {
  const [value] = useCell(doc, rowId, columnId)
  return <div className='text-slate-600 text-xs'>{value}</div>
}
