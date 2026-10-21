import ms from 'ms'
import {
  isReportTimeDimension,
  MAX_REPORT_SERIES,
  REPORT_MEASURES,
  type ReportSpec
} from '../../client/shared/reports/reportCatalog'
import type {ReportRow} from './buildReportRows'

const DAY_MS = ms('1d')

export const applyReportConditions = (rows: ReportRow[], spec: ReportSpec, now: Date) => {
  const {where, measures} = spec
  if (where.length === 0) return rows
  return rows.filter((row) =>
    where.every(({measure, operator, value}) => {
      const rowValue = row.values[measures.indexOf(measure)] ?? null
      if (operator === 'OLDER_THAN_DAYS') {
        return rowValue === null || rowValue < now.getTime() - value * DAY_MS
      }
      if (rowValue === null) return false
      if (operator === 'WITHIN_DAYS') return rowValue >= now.getTime() - value * DAY_MS
      if (operator === 'AT_LEAST') return rowValue >= value
      if (operator === 'AT_MOST') return rowValue <= value
      return rowValue === value
    })
  )
}

const firstCategoryPosition = (spec: ReportSpec) =>
  spec.breakdown.findIndex(({dimension}) => !isReportTimeDimension(dimension))

// nulls sort last whichever way the rows run
const compareValues = (a: number | null, b: number | null, direction: number) => {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return direction * (a - b)
}

const resolveSort = (spec: ReportSpec) => {
  const hasTime = spec.breakdown.some(({dimension}) => isReportTimeDimension(dimension))
  const by = spec.sort?.by ?? (hasTime ? 'TIME' : 'VALUE')
  const order = spec.sort?.order ?? (by === 'VALUE' ? 'DESC' : 'ASC')
  return {by, direction: order === 'DESC' ? -1 : 1}
}

export const sortReportRows = (rows: ReportRow[], spec: ReportSpec) => {
  const {by, direction} = resolveSort(spec)
  const namePosition = firstCategoryPosition(spec)
  const nameOf = (row: ReportRow) =>
    namePosition === -1 ? '' : (row.keys[namePosition]?.label ?? '')
  const byName = (a: ReportRow, b: ReportRow) => nameOf(a).localeCompare(nameOf(b))
  const byTime = (a: ReportRow, b: ReportRow) => a.stepIndex - b.stepIndex
  return [...rows].sort((a, b) => {
    if (by === 'TIME') return direction * byTime(a, b) || byName(a, b)
    if (by === 'NAME') return direction * byName(a, b) || byTime(a, b)
    return (
      compareValues(a.values[0] ?? null, b.values[0] ?? null, direction) ||
      byName(a, b) ||
      byTime(a, b)
    )
  })
}

// Keeps the rows whose value at a position is among the top few, ranked as the rows are sorted.
// A time sort still ranks by the first measure, biggest first
const keepTopValues = (rows: ReportRow[], spec: ReportSpec, position: number, count: number) => {
  const isLatest = REPORT_MEASURES[spec.measures[0]!].kind === 'latest'
  const totals = new Map<string, {label: string; total: number | null}>()
  for (const row of rows) {
    const key = row.keys[position]
    if (!key) continue
    const value = row.values[0] ?? null
    const entry = totals.get(key.value) ?? {label: key.label, total: null}
    if (value !== null) {
      entry.total =
        entry.total === null ? value : isLatest ? Math.max(entry.total, value) : entry.total + value
    }
    totals.set(key.value, entry)
  }
  const {by, direction} = resolveSort(spec)
  const ranked = [...totals.entries()].sort(([, a], [, b]) =>
    by === 'NAME'
      ? direction * a.label.localeCompare(b.label)
      : compareValues(a.total, b.total, by === 'VALUE' ? direction : -1) ||
        a.label.localeCompare(b.label)
  )
  const kept = new Set(ranked.slice(0, count).map(([value]) => value))
  return rows.filter((row) => kept.has(row.keys[position]?.value ?? ''))
}

export const limitReportRows = (rows: ReportRow[], spec: ReportSpec) => {
  const position = firstCategoryPosition(spec)
  if (!spec.limit || position === -1) return rows
  return keepTopValues(rows, spec, position, spec.limit)
}

// Lines and stacks past the sixth are hard to tell apart, so only the biggest six are kept
export const capReportSeries = (rows: ReportRow[], spec: ReportSpec) => {
  const [, second] = spec.breakdown
  const hasSeries = (spec.showAs === 'LINE' || spec.showAs === 'BARS') && second
  if (!hasSeries || isReportTimeDimension(second.dimension)) return rows
  return keepTopValues(rows, spec, 1, MAX_REPORT_SERIES)
}
