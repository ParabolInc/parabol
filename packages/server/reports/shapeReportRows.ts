import ms from 'ms'
import {
  isReportTimeDimension,
  MAX_REPORT_SERIES,
  REPORT_MEASURES,
  REPORT_TASK_AGES,
  type ReportDimension,
  type ReportMeasureKind,
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

const TASK_AGES: string[] = Object.keys(REPORT_TASK_AGES)

// Values that run in their own order, which a report keeps unless it's sorted another way. Team Health
// categories run in the order they were made, which puts the built-in ones in their usual order
const NATURAL_ORDERS: Partial<Record<ReportDimension, (a: string, b: string) => number>> = {
  TASK_AGE: (a, b) => TASK_AGES.indexOf(a) - TASK_AGES.indexOf(b),
  CATEGORY: (a, b) => Number(a) - Number(b)
}

// Dates take the latest, and shares, medians and scores, which don't add up, take their mean
const combineValues = (kind: ReportMeasureKind, values: number[]) => {
  if (values.length === 0) return null
  if (kind === 'latest') return values.reduce((latest, value) => Math.max(latest, value))
  const sum = values.reduce((total, value) => total + value, 0)
  return kind === 'count' || kind === 'distinct' || kind === 'reading' ? sum : sum / values.length
}

// Each value at a breakdown position with its label and the first measure's total
const totalsAt = (rows: ReportRow[], spec: ReportSpec, position: number) => {
  const {kind} = REPORT_MEASURES[spec.measures[0]!]
  const entries = new Map<string, {label: string; values: number[]}>()
  for (const row of rows) {
    const key = row.keys[position]
    if (!key) continue
    const entry = entries.get(key.value) ?? {label: key.label, values: []}
    const value = row.values[0]
    if (value != null) entry.values.push(value)
    entries.set(key.value, entry)
  }
  return new Map(
    [...entries].map(([value, {label, values}]) => [
      value,
      {label, total: combineValues(kind, values)}
    ])
  )
}

// Time runs in order, unless the rows are sorted by value with nothing else to sort them by.
// Everything else ranks by its total, or by name, so a group's rows stay together
const rankValuesAt = (rows: ReportRow[], spec: ReportSpec, position: number) => {
  const {by, direction} = resolveSort(spec)
  const entries = [...totalsAt(rows, spec, position).entries()]
  const {dimension} = spec.breakdown[position]!
  const isTime = isReportTimeDimension(dimension)
  const naturalOrder = NATURAL_ORDERS[dimension]
  if (isTime && (by !== 'VALUE' || firstCategoryPosition(spec) !== -1)) {
    const timeDirection = by === 'TIME' ? direction : 1
    entries.sort(([a], [b]) => timeDirection * a.localeCompare(b))
  } else if (naturalOrder && !spec.sort) {
    entries.sort(([a], [b]) => naturalOrder(a, b))
  } else if (by === 'NAME') {
    entries.sort(([, a], [, b]) => direction * a.label.localeCompare(b.label))
  } else {
    entries.sort(
      ([, a], [, b]) =>
        compareValues(a.total, b.total, by === 'VALUE' ? direction : -1) ||
        a.label.localeCompare(b.label)
    )
  }
  return entries.map(([value]) => value)
}

export const sortReportRows = (rows: ReportRow[], spec: ReportSpec) => {
  const ranks = spec.breakdown.map(
    (_, position) => new Map(rankValuesAt(rows, spec, position).map((value, rank) => [value, rank]))
  )
  const rankOf = (row: ReportRow, position: number) =>
    ranks[position]!.get(row.keys[position]?.value ?? '') ?? 0
  return [...rows].sort((a, b) => {
    for (let position = 0; position < ranks.length; position++) {
      const difference = rankOf(a, position) - rankOf(b, position)
      if (difference !== 0) return difference
    }
    return 0
  })
}

const keepTopValues = (rows: ReportRow[], spec: ReportSpec, position: number, count: number) => {
  const kept = new Set(rankValuesAt(rows, spec, position).slice(0, count))
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
