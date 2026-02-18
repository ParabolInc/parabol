import * as Y from 'yjs'
import {columnsAreDefault} from './columnsAreDefault'
import {appendColumn, appendRow, changeColumn, getColumns} from './data'

const HEADER_MISMATCH = 'CSV headers do not match current table columns'

export const getRecordHeaders = (records: (string | null)[][], firstRowIsHeader: boolean) => {
  // data may be sparse, make sure to have columns for each row
  const columnCount = Math.max(...records.map((row) => row.length))

  const firstRowHeaders = (firstRowIsHeader && records[0]) || []

  const newHeaders = Array.from(
    {length: columnCount},
    (_, index) => firstRowHeaders[index]?.toString() || `Column ${index + 1}`
  )

  return newHeaders
}

export const importRecords = (
  doc: Y.Doc,
  viewerId: string,
  records: (string | null)[][],
  {firstRowIsHeader}: {firstRowIsHeader: boolean}
) => {
  doc.transact(() => {
    if (records.length === 0) return

    const newHeaders = getRecordHeaders(records, firstRowIsHeader)

    const columns = getColumns(doc).toArray()
    if (columnsAreDefault(doc)) {
      columns.forEach((columnId, index) => {
        changeColumn(doc, columnId, {name: newHeaders[index]!, type: 'text'})
      })
    }
    newHeaders.slice(columns.length).forEach((name) => {
      appendColumn(doc, {name, type: 'text'})
    })

    const firstRowOffset = firstRowIsHeader ? 1 : 0
    records.slice(firstRowOffset).forEach((record) => {
      if (columns.length < record.length) {
        throw new Error(HEADER_MISMATCH)
      }
      const mappedRecord = Object.fromEntries(record.map((value, index) => [columns[index], value]))
      appendRow(doc, viewerId, mappedRecord)
    })
  })
}
