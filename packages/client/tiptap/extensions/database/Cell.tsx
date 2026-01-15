import {HocuspocusProvider} from '@hocuspocus/provider'
import {CheckCell} from './CheckCell'
import {ColumnId, RowId} from './data'
import {useColumnType} from './hooks'
import {NumberCell} from './NumberCell'
import {StatusCell} from './StatusCell'
import {TagsCell} from './TagsCell'
import {TextCell} from './TextCell'

export const Cell = (props: {
  provider: HocuspocusProvider
  rowId: RowId
  columnId: ColumnId
  userId?: string
}) => {
  const {provider, columnId} = props
  const {document: doc} = provider
  const type = useColumnType(doc, columnId)

  switch (type) {
    case 'number':
      return <NumberCell {...props} />
    case 'check':
      return <CheckCell {...props} />
    case 'status':
      return <StatusCell {...props} />
    case 'tags':
      return <TagsCell {...props} />
    default:
      return <TextCell {...props} />
  }
}
