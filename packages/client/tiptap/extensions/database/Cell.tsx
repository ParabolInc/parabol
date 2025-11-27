import * as Y from 'yjs'
import {CheckCell} from './CheckCell'
import {ColumnId, RowId} from './data'
import {NumberCell} from './NumberCell'
import {StatusCell} from './StatusCell'
import {TagsCell} from './TagsCell'
import {TextCell} from './TextCell'
import {DataType} from './types'

export const Cell = (props: {
  type: DataType
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
  userId?: string
}) => {
  const {type, ...rest} = props

  switch (type) {
    case 'number':
      return <NumberCell {...rest} />
    case 'check':
      return <CheckCell {...rest} />
    case 'status':
      return <StatusCell {...rest} />
    case 'tags':
      return <TagsCell {...rest} />
    default:
      return <TextCell {...rest} />
  }
}
