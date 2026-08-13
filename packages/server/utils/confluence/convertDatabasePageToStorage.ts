import * as Y from 'yjs'
import {statusMacro} from './convertTipTapToConfluenceStorage'
import {escapeXml} from './escapeXhtml'
import type {StorageConversionCtx, StorageConversionResult} from './types'

// Mirrors packages/client/tiptap/extensions/database/data.ts (yjs layout):
// rows: Y.Array<string> · columns: Y.Array<string> · columnMeta: Y.Map<{name, type}> ·
// data: Y.Map<rowId, Y.Array<{key, val}> | legacy Y.Map<string>>
// Cell encodings: check = 'true'/'false' · tags = comma-separated · status = plain string
type ColumnMeta = {name: string; type: 'text' | 'number' | 'check' | 'status' | 'tags'}
type RawCell = {key: string; val: string | null}

const readRowCells = (row: unknown): Map<string, string | null> => {
  const cells = new Map<string, string | null>()
  if (row instanceof Y.Map) {
    row.forEach((val, key) => cells.set(key, val as string | null))
  } else if (row instanceof Y.Array) {
    // YKeyValue semantics: later entries win — do NOT mutate/convert the doc here
    ;(row.toArray() as RawCell[]).forEach(({key, val}) => cells.set(key, val))
  }
  return cells
}

const renderCell = (value: string | null, type: ColumnMeta['type']): string => {
  if (value == null || value === '') return type === 'check' ? '—' : ''
  switch (type) {
    case 'check':
      return value === 'true' ? '✓' : '—'
    case 'status':
      return statusMacro('Grey', value)
    case 'tags':
      return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => statusMacro('Grey', tag))
        .join(' ')
    default:
      return escapeXml(value)
  }
}

export const convertDatabasePageToStorage = (
  ydoc: Y.Doc,
  ctx: StorageConversionCtx & {snapshotDate: string; pageTitle: string}
): StorageConversionResult => {
  const columnIds = ydoc.getArray<string>('columns').toArray()
  const columnMeta = ydoc.getMap<ColumnMeta>('columnMeta')
  const rowIds = ydoc.getArray<string>('rows').toArray()
  const data = ydoc.getMap<unknown>('data')

  const columns = columnIds.map((id) => columnMeta.get(id) ?? {name: '', type: 'text' as const})
  const headerRow = `<tr>${columns.map((col) => `<th>${escapeXml(col.name)}</th>`).join('')}</tr>`
  const bodyRows = rowIds
    .map((rowId) => {
      const cells = readRowCells(data.get(rowId))
      const tds = columnIds
        .map((colId, i) => `<td>${renderCell(cells.get(colId) ?? null, columns[i]!.type)}</td>`)
        .join('')
      return `<tr>${tds}</tr>`
    })
    .join('')

  const note = `<p><em>Snapshot from Parabol · ${escapeXml(ctx.snapshotDate)} · <a href="${escapeXml(ctx.parabolPageUrl)}">live version ↗</a></em></p>`
  const footer = `<p><em>Exported from Parabol · <a href="${escapeXml(ctx.parabolPageUrl)}">Open the live page</a></em></p>`
  return {
    title: ctx.pageTitle,
    xhtml: `${note}<table><tbody>${headerRow}${bodyRows}</tbody></table>${footer}`,
    assets: [],
    degraded: [{blockType: 'database', count: 1, treatment: 'exported as a static table snapshot'}]
  }
}
