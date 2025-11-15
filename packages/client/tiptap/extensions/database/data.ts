import * as Y from 'yjs'
import {DataType} from './types'

export type ColumnId = string
export type RowId = string
export type ColumnMeta = {
  name: string
  type: DataType
}

const cloneColumnMeta = (meta: ColumnMeta): ColumnMeta => {
  return {
    name: meta.name,
    type: meta.type
  }
}

const generateId = (doc: Y.Doc) => {
  const id = Math.random().toString(36).substring(2, 9)
  for (const column of doc.getArray<ColumnId>('columns')) {
    if (id === column) {
      return generateId(doc)
    }
  }
  for (const row of doc.getArray<RowId>('rows')) {
    if (id === row) {
      return generateId(doc)
    }
  }
  return id
}

export const changeColumn = (doc: Y.Doc, columnId: ColumnId, newMeta: ColumnMeta) => {
  const columnMeta = doc.getMap<ColumnMeta>('columnMeta')
  columnMeta.set(columnId, newMeta)
}

// Needs to be added to a column!
const createDanglingColumn = (doc: Y.Doc) => {
  const id = generateId(doc)
  doc.getMap<ColumnMeta>('columnMeta').set(id, {name: 'New column', type: 'text'})

  const rows = doc.getArray<RowId>('rows')
  const data = doc.getMap<Y.Text>('data')
  rows.forEach((rowId) => {
    data.set(`${rowId}-${id}`, new Y.Text())
  })

  return id
}

export const insertColumnAt = (doc: Y.Doc, index: number) => {
  const columns = doc.getArray<ColumnId>('columns')
  const id = createDanglingColumn(doc)
  columns.insert(index, [id])
}

export const appendColumn = (doc: Y.Doc) => {
  const columns = doc.getArray<ColumnId>('columns')
  const id = createDanglingColumn(doc)
  columns.push([id])
}

export const duplicateColumn = (doc: Y.Doc, columnId: ColumnId) => {
  const id = generateId(doc)
  const columnMeta = doc.getMap<ColumnMeta>('columnMeta')
  const existingMeta = columnMeta.get(columnId)
  if (!existingMeta) {
    throw new Error(`Column meta not found for columnId: ${columnId}`)
  }
  columnMeta.set(id, cloneColumnMeta(existingMeta))

  const rows = doc.getArray<RowId>('rows')
  const data = doc.getMap<Y.Text>('data')
  rows.forEach((rowId) => {
    const sourceText = data.get(`${rowId}-${columnId}`)
    data.set(`${rowId}-${id}`, sourceText?.clone() ?? new Y.Text())
  })

  const columns = doc.getArray<ColumnId>('columns')
  const index = columns.toArray().indexOf(columnId)
  columns.insert(index + 1, [id])
}

export const deleteColumn = (doc: Y.Doc, columnId: ColumnId) => {
  const columns = doc.getArray<ColumnId>('columns')
  const index = columns.toArray().indexOf(columnId)
  columns.delete(index, 1)

  const rows = doc.getArray<RowId>('rows')
  const data = doc.getMap<Y.Text>('data')
  rows.forEach((rowId) => {
    data.delete(`${rowId}-${columnId}`)
  })
}

export const appendRow = (doc: Y.Doc) => {
  const id = generateId(doc)
  const rows = doc.getArray<RowId>('rows')
  const columns = doc.getArray<ColumnId>('columns')
  const data = doc.getMap<Y.Text>('data')
  columns.forEach((columnId) => {
    data.set(`${id}-${columnId}`, new Y.Text())
  })
  rows.push([id])
}

export const deleteRow = (doc: Y.Doc, rowId: RowId) => {
  const rows = doc.getArray<RowId>('rows')
  const index = rows.toArray().indexOf(rowId)
  if (index !== -1) {
    rows.delete(index, 1)
  }

  const columns = doc.getArray<ColumnId>('columns')
  const data = doc.getMap<Y.Text>('data')
  columns.forEach((columnId) => {
    data.delete(`${rowId}-${columnId}`)
  })
}
