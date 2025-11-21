import * as Y from 'yjs'
import {CheckCell} from './CheckCell'
import {ColumnId, RowId} from './data'
import {NumberCell} from './NumberCell'
import {StatusCell} from './StatusCell'
import {TagsCell} from './TagsCell'
import {TextCell} from './TextCell'
import {DataType} from './types'

export const Cell = (props: {type: DataType; doc: Y.Doc; rowId: RowId; columnId: ColumnId}) => {
  const {type, doc, rowId, columnId} = props

  switch (type) {
    case 'number':
      return <NumberCell doc={doc} rowId={rowId} columnId={columnId} />
    case 'check':
      return <CheckCell doc={doc} rowId={rowId} columnId={columnId} />
    case 'status':
      return <StatusCell doc={doc} rowId={rowId} columnId={columnId} />
    case 'tags':
      return <TagsCell doc={doc} rowId={rowId} columnId={columnId} />
    default:
      return <TextCell doc={doc} rowId={rowId} columnId={columnId} />
  }
}
