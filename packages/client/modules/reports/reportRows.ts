import type {ReportView_result$data} from '../../__generated__/ReportView_result.graphql'

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

export const sumReportValues = (values: readonly (number | null | undefined)[]) =>
  values.reduce<number>((sum, value) => sum + (value ?? 0), 0)

// Drops the series with nothing in them, like a meeting type no one ran, unless that leaves none
export const withValues = (series: ReportResultKey[], rows: readonly ReportResultRow[]) => {
  const valued = series.filter(({value}) =>
    rows.some(({keys, values}) => keys[1]?.value === value && !!values[0])
  )
  return valued.length > 0 ? valued : series
}
