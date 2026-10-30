import {
  REPORT_MEASURES,
  type ReportDimension,
  type ReportMeasure
} from '../../shared/reports/reportCatalog'
import {formatReportKey} from './formatReportKey'
import {distinctKeysAt, type ReportResultKey, type ReportResultRow} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

export interface ReportHeatmapValue {
  value: number | null
  previous: number | null
}

export interface ReportHeatmapRow {
  id: string
  name: string
  keys: ReportResultKey[]
  // each key's label, as the row shows it
  labels: string[]
  cells: Map<string, ReportHeatmapValue>
  total: ReportHeatmapValue | null
}

export interface ReportHeatmapRowGroup {
  id: string
  // what the first breakdown labels the rows under it, when rows split twice
  label: string | null
  rows: ReportHeatmapRow[]
}

export interface ReportRowTotal {
  keys: readonly {value: string}[]
  values: readonly (number | null | undefined)[]
  previousValues: readonly (number | null | undefined)[] | null | undefined
}

export const toReportHeatmapRowId = (keys: readonly {value: string}[]) =>
  keys.map(({value}) => value).join('|')

const toHeatmapValue = ({values, previousValues}: Omit<ReportRowTotal, 'keys'>) => ({
  value: values[0] ?? null,
  previous: previousValues?.[0] ?? null
})

// A row for each combination of every breakdown but the last, whose values give the columns
export const toReportHeatmapGrid = (
  dimensions: ReportDimension[],
  step: ReportStepLength | null | undefined,
  rows: readonly ReportResultRow[],
  rowTotals: readonly ReportRowTotal[]
) => {
  const columnPosition = dimensions.length - 1
  const totals = new Map(rowTotals.map((total) => [toReportHeatmapRowId(total.keys), total]))
  const gridRows = new Map<string, ReportHeatmapRow>()
  rows.forEach((row) => {
    const rowKeys = row.keys.slice(0, columnPosition)
    const id = toReportHeatmapRowId(rowKeys)
    const total = totals.get(id)
    const labels = rowKeys.map((key, position) => formatReportKey(key, dimensions[position]!, step))
    const gridRow = gridRows.get(id) ?? {
      id,
      name: labels.join(' › '),
      keys: rowKeys,
      labels,
      cells: new Map(),
      total: total ? toHeatmapValue(total) : null
    }
    gridRow.cells.set(row.keys[columnPosition]!.value, toHeatmapValue(row))
    gridRows.set(id, gridRow)
  })
  return {columns: distinctKeysAt(rows, columnPosition), rows: [...gridRows.values()]}
}

// When rows split twice, like by business unit then team, each value of the first labels the rows under it, which
// alone get cells
export const groupReportHeatmapRows = (rows: readonly ReportHeatmapRow[]) => {
  const groups = new Map<string, ReportHeatmapRowGroup>()
  rows.forEach((row) => {
    const isGrouped = row.keys.length > 1
    const id = isGrouped ? row.keys[0]!.value : ''
    const group = groups.get(id) ?? {id, label: isGrouped ? row.labels[0]! : null, rows: []}
    group.rows.push(row)
    groups.set(id, group)
  })
  return [...groups.values()]
}

// a row under a label shows only its own name
export const toReportHeatmapRowName = (row: ReportHeatmapRow) =>
  row.keys.length > 1 ? row.labels[row.labels.length - 1]! : row.name

// a count of 0 is nothing, but a share or score of 0 is a value
export const hasNothing = ({cells, total}: ReportHeatmapRow, isAdditive: boolean) => {
  const isEmpty = (cell: ReportHeatmapValue | null) =>
    !cell || cell.value === null || (isAdditive && cell.value === 0)
  return [...cells.values()].every(isEmpty) && isEmpty(total)
}

export const toTotalHeading = (measure: ReportMeasure, isOverTime: boolean) => {
  const {kind} = REPORT_MEASURES[measure]
  if (kind === 'latest' || (kind === 'reading' && isOverTime)) return 'Latest'
  if (kind === 'share' || kind === 'median' || kind === 'score') return 'Overall'
  return 'Total'
}
