import {REPORT_MEASURES, type ReportSpec} from '../../shared/reports/reportCatalog'
import {formatReportKey} from './formatReportKey'
import {formatReportValue} from './formatReportValue'
import {type ReportResultRow, sumReportValues} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
}

const SHOWN_ROW_COUNT = 5

// A table on a card: its numbers, or its totals when it has several, or its first few rows
const ReportTableSummary = ({spec, step, rows}: Props) => {
  const {measures, breakdown} = spec
  const measureIdxs = measures.map((_, idx) => idx)
  const countIdxs = measureIdxs.filter((idx) => REPORT_MEASURES[measures[idx]!].kind === 'count')
  const isOneRow = breakdown.length === 0
  if (isOneRow || (measures.length > 1 && countIdxs.length > 0)) {
    return (
      <div className='flex flex-wrap gap-x-8 gap-y-2'>
        {(isOneRow ? measureIdxs : countIdxs).map((measureIdx) => {
          const measure = measures[measureIdx]!
          const value = isOneRow
            ? rows[0]?.values[measureIdx]
            : sumReportValues(rows.map(({values}) => values[measureIdx]))
          return (
            <div key={measure} className='flex flex-col'>
              <span className='font-bold text-2xl tabular-nums'>
                {formatReportValue(measure, value)}
              </span>
              <span className='text-fg-secondary text-sm'>{REPORT_MEASURES[measure].label}</span>
            </div>
          )
        })}
      </div>
    )
  }
  const shownRows = rows.slice(0, SHOWN_ROW_COUNT)
  return (
    <div className='flex flex-col'>
      {shownRows.map((row) => (
        <div
          key={row.keys.map(({value}) => value).join('|')}
          className='flex min-h-8 items-center justify-between gap-3 border-hairline border-t text-sm'
        >
          <span className='truncate'>
            {row.keys
              .map((key, position) => formatReportKey(key, breakdown[position]!.dimension, step))
              .join(' › ')}
          </span>
          <span className='whitespace-nowrap text-fg-secondary tabular-nums'>
            {formatReportValue(measures[0]!, row.values[0])}
          </span>
        </div>
      ))}
      {rows.length > shownRows.length && (
        <span className='border-hairline border-t pt-2 text-fg-muted text-xs'>
          {rows.length - shownRows.length} more in the report
        </span>
      )}
    </div>
  )
}

export default ReportTableSummary
