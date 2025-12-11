import {HocuspocusProvider} from '@hocuspocus/provider'
import {ColumnId, RowId} from './data'
import {useColumnType} from './hooks'
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
    /*
    case 'number':
      return <NumberCell {...rest} />
    case 'check':
      return <CheckCell {...rest} />
    case 'status':
      return <StatusCell {...rest} />
    case 'tags':
      return <TagsCell {...rest} />
     */
    default:
      return <TextCell {...props} />
  }
}
