import * as Y from 'yjs'
import {CheckCell} from './CheckCell'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'
import {NumberCell} from './NumberCell'
import {StatusCell} from './StatusCell'
import {TagsCell} from './TagsCell'
import {TextCell} from './TextCell'
import {DataType} from './types'

export const Cell = (props: {type: DataType; doc: Y.Doc; rowId: RowId; columnId: ColumnId}) => {
  const {type, doc, rowId, columnId} = props

  const text = useCell(doc, rowId, columnId)

  switch (type) {
    case 'number':
      return <NumberCell text={text} />
    case 'check':
      return <CheckCell text={text} />
    case 'status':
      return <StatusCell doc={doc} rowId={rowId} columnId={columnId} />
    case 'tags':
      return <TagsCell doc={doc} rowId={rowId} columnId={columnId} />
    default:
      return <TextCell text={text} />
  }
}
