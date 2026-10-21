import {REPORT_MEASURES, type ReportSpec} from '../../shared/reports/reportCatalog'
import {formatReportKey} from './formatReportKey'
import type {ReportResultRow} from './reportRows'
import {formatReportDimension, type ReportStepLength} from './reportSpecLabels'

// a cell a spreadsheet would read as a formula gets a leading quote, so a team name can't run code
const toCell = (cell: string | number | null | undefined) => {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') return String(cell)
  const text = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const toReportCSV = (
  spec: ReportSpec,
  step: ReportStepLength | null | undefined,
  rows: readonly ReportResultRow[]
) => {
  const header = [
    ...spec.breakdown.map(({dimension}) => formatReportDimension(dimension, step)),
    ...spec.measures.map((measure) => REPORT_MEASURES[measure].label)
  ]
  const lines = rows.map(({keys, values}) => [
    ...keys.map((key, position) =>
      formatReportKey(key, spec.breakdown[position]!.dimension, step, true)
    ),
    ...spec.measures.map((measure, idx) => {
      const value = values[idx]
      if (value == null) return null
      return REPORT_MEASURES[measure].kind === 'latest'
        ? new Date(value).toISOString().slice(0, 10)
        : value
    })
  ])
  return [header, ...lines].map((cells) => cells.map(toCell).join(',')).join('\r\n')
}
