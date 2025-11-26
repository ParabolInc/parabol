import * as Y from 'yjs'
import {DATABASE_COLUMN_NAME_MAX_CHARS} from '../../../utils/constants'

/**
 * yjs data layout:
 * - rows: Array<RowId>
 * - columns: Array<ColumnId>
 * - columnMeta: Map<ColumnId, ColumnMeta>
 * - data: Map<RowId, Map<ColumnId, string>>
 *
 * Future:
 * - views: Array<ViewId>
 * - viewMeta: Map<ViewId, View>
 */

export type ColumnId = string
export type RowId = string
export type RowData = Y.Map<string>

export type DataType = 'text' | 'number' | 'check' | 'status' | 'tags'
export type ColumnMeta = {
  name: string
  type: DataType
}

export type View = {
  name: string
  sorting: {id: ColumnId; direction: 'asc' | 'desc'}[]
  // subset of columns visible in this view
  columns: {
    id: ColumnId
    size?: number
  }[]
}

const defaultColumnMeta: ColumnMeta = {
  name: 'New column',
  type: 'text'
}

const generateId = (_doc: Y.Doc) => {
  return crypto.randomUUID()
}

export const getRows = (doc: Y.Doc) => {
  return doc.getArray<RowId>('rows')
}

export const getColumns = (doc: Y.Doc) => {
  return doc.getArray<ColumnId>('columns')
}

export const changeColumn = (doc: Y.Doc, columnId: ColumnId, newMeta: ColumnMeta) => {
  const columnMeta = doc.getMap<ColumnMeta>('columnMeta')
  columnMeta.set(columnId, {
    ...newMeta,
    name: newMeta.name.substring(0, DATABASE_COLUMN_NAME_MAX_CHARS)
  })
}

const insertColumnAt = (doc: Y.Doc, index: number, meta: ColumnMeta = defaultColumnMeta) => {
  const id = generateId(doc)
  doc.transact(() => {
    changeColumn(doc, id, meta)
    const columns = doc.getArray<ColumnId>('columns')
    columns.insert(index, [id])
  })
  return id
}

export const insertColumnBefore = (
  doc: Y.Doc,
  columnId: ColumnId,
  meta: ColumnMeta = defaultColumnMeta
) => {
  const columns = doc.getArray<ColumnId>('columns')
  const index = columns.toArray().indexOf(columnId)
  return insertColumnAt(doc, index, meta)
}

export const insertColumnAfter = (
  doc: Y.Doc,
  columnId: ColumnId,
  meta: ColumnMeta = defaultColumnMeta
) => {
  const columns = doc.getArray<ColumnId>('columns')
  const index = columns.toArray().indexOf(columnId)
  return insertColumnAt(doc, index + 1, meta)
}

export const appendColumn = (doc: Y.Doc, meta: ColumnMeta = defaultColumnMeta) => {
  const id = generateId(doc)
  doc.transact(() => {
    changeColumn(doc, id, meta)
    const columns = doc.getArray<ColumnId>('columns')
    columns.push([id])
  })
  return id
}

export const duplicateColumn = (doc: Y.Doc, columnId: ColumnId) => {
  const id = generateId(doc)
  doc.transact(() => {
    const columnMeta = doc.getMap<ColumnMeta>('columnMeta')
    const existingMeta = columnMeta.get(columnId)
    if (!existingMeta) {
      throw new Error(`Column meta not found for columnId: ${columnId}`)
    }
    columnMeta.set(id, {...existingMeta})

    const data = doc.getMap<RowData>('data')
    data.forEach((value) => {
      const source = value.get(columnId)
      if (source !== undefined) {
        value.set(id, source)
      }
    })

    const columns = doc.getArray<ColumnId>('columns')
    const index = columns.toArray().indexOf(columnId)
    columns.insert(index + 1, [id])
  })
  return id
}

export const deleteColumn = (doc: Y.Doc, columnId: ColumnId) => {
  doc.transact(() => {
    const columns = doc.getArray<ColumnId>('columns')
    const index = columns.toArray().indexOf(columnId)
    columns.delete(index, 1)

    const data = doc.getMap<RowData>('data')
    data.forEach((row, key) => {
      if (row.delete) {
        row.delete(columnId)
      } else {
        console.warn('Invalid row data structure, expected Y.Map', key, row)
      }
    })
  })
}

export const appendRow = (doc: Y.Doc, userId?: string) => {
  const id = generateId(doc)
  doc.transact(() => {
    const rows = doc.getArray<RowId>('rows')
    const data = doc.getMap<RowData>('data')
    const row = new Y.Map<any>()
    if (userId) {
      row.set('_createdBy', userId)
      row.set('_createdAt', Date.now())
    }
    data.set(id, row)
    rows.push([id])
  })
  return id
}

export const deleteRow = (doc: Y.Doc, rowId: RowId) => {
  doc.transact(() => {
    const rows = doc.getArray<RowId>('rows')
    const index = rows.toArray().indexOf(rowId)
    if (index !== -1) {
      rows.delete(index, 1)
    }

    const data = doc.getMap<RowData>('data')
    data.delete(rowId)
  })
}
