import * as Y from 'yjs'
import {columnsAreDefault} from './columnsAreDefault'
import {appendColumn, changeColumn, generateId, getColumns} from './data'

const CHUNK_SIZE = 10_000

export const getRecordHeaders = (records: (string | null)[][], firstRowIsHeader: boolean) => {
  // data may be sparse, but let's only consider the length of the first 100 rows
  const columnCount = Math.max(...records.slice(0, 100).map((row) => row.length))

  const firstRowHeaders = (firstRowIsHeader && records[0]) || []

  const newHeaders = Array.from(
    {length: columnCount},
    (_, index) => firstRowHeaders[index]?.toString() || `Column ${index + 1}`
  )

  return newHeaders
}

function* chunkArray<T>(array: T[], chunkSize: number): Generator<[T[], number]> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield [array.slice(i, i + chunkSize), i]
  }
}

export const importRecords = (
  doc: Y.Doc,
  viewerId: string,
  records: (string | null)[][],
  {firstRowIsHeader}: {firstRowIsHeader: boolean}
) => {
  if (records.length === 0) return

  // prepare columns
  doc.transact(() => {
    const newHeaders = getRecordHeaders(records, firstRowIsHeader)

    const columns = getColumns(doc).toArray()
    if (columnsAreDefault(doc)) {
      columns.forEach((columnId, index) => {
        changeColumn(doc, columnId, {name: newHeaders[index]!, type: 'text'})
      })
    }
    newHeaders.slice(columns.length).forEach((name) => {
      columns.push(appendColumn(doc, {name, type: 'text'}))
    })
  })

  // insert records
  const chunks = chunkArray(records, CHUNK_SIZE)
  for (const chunk of chunks) {
    const [records] = chunk
    doc.transact(() => {
      const rowIds = records.map(() => generateId(doc))
      doc.getArray('rows').push(rowIds)

      const data = doc.getMap('data')

      const now = Date.now()
      const headers = getColumns(doc).toArray()
      records.forEach((record, index) => {
        // we only check the first 100 rows for the column count, don't fail if there are longer rows later on
        while (headers.length < record.length) {
          headers.push(appendColumn(doc, {name: `Column ${headers.length + 1}`, type: 'text'}))
        }

        const rowId = rowIds[index]!
        const row = record
          .map((value, index) => ({key: headers[index], val: value}))
          .filter(({val}) => val !== '' && val !== undefined && val !== null)
        row.push({key: `_createdAt`, val: now as any}, {key: `_createdBy`, val: viewerId})
        data.set(rowId, Y.Array.from(row))
      })
    })
  }
}
