import * as Y from 'yjs'
import {DEFAULT_COLUMNS} from './Database'
import {getColumnMeta, getColumns} from './data'

export const columnsAreDefault = (doc: Y.Doc) => {
  const columns = getColumns(doc)
  const columnMeta = getColumnMeta(doc)
  if (columns.length !== DEFAULT_COLUMNS.length) return false
  for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
    const columnId = columns.get(i)!
    const meta = columnMeta.get(columnId)
    if (!meta) return false
    if (meta.name !== DEFAULT_COLUMNS[i]!.name || meta.type !== DEFAULT_COLUMNS[i]!.type) {
      return false
    }
  }
  return true
}
