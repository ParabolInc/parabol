import type {ReportView_result$data} from '../../__generated__/ReportView_result.graphql'
import {REPORT_HIDDEN_VALUE} from '../../shared/reports/reportCatalog'

export type ReportResultRow = ReportView_result$data['rows'][number]
export type ReportResultKey = ReportResultRow['keys'][number]

// The distinct keys at a breakdown position in the order the rows name them, which the server ranks
export const distinctKeysAt = (rows: readonly ReportResultRow[], position: number) => {
  const keys = new Map<string, ReportResultKey>()
  rows.forEach((row) => {
    const key = row.keys[position]
    if (key && !keys.has(key.value)) keys.set(key.value, key)
  })
  return [...keys.values()]
}

export const isHiddenReportValue = (value: number | null | undefined) =>
  value === REPORT_HIDDEN_VALUE

export const sumReportValues = (values: readonly (number | null | undefined)[]) =>
  values.reduce<number>(
    (sum, value) => sum + (value == null || isHiddenReportValue(value) ? 0 : value),
    0
  )

const toShownValue = (value: number | null | undefined) =>
  isHiddenReportValue(value) ? null : value

// Charts have no cell to mark, so a hidden value is drawn as nothing
export const withoutHiddenValues = (rows: readonly ReportResultRow[]) =>
  rows.map((row) => ({
    ...row,
    values: row.values.map(toShownValue),
    previousValues: row.previousValues?.map(toShownValue)
  }))

// Drops the series with nothing in them, like a meeting type no one ran, unless that leaves none
export const withValues = (series: ReportResultKey[], rows: readonly ReportResultRow[]) => {
  const valued = series.filter(({value}) =>
    rows.some(({keys, values}) => keys[1]?.value === value && !!values[0])
  )
  return valued.length > 0 ? valued : series
}
