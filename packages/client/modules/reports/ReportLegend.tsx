import {REPORT_MEASURES, type ReportMeasure} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {type ReportResultKey, type ReportResultRow, sumReportValues} from './reportRows'
import type {ReportSeriesColor} from './reportSeriesColors'

interface Props {
  measure: ReportMeasure
  series: {key: ReportResultKey | null; label: string; color: ReportSeriesColor}[]
  rows: readonly ReportResultRow[]
}

// series are the second breakdown; counts show their total beside the name
const ReportLegend = ({measure, series, rows}: Props) => {
  const isCount = REPORT_MEASURES[measure].kind === 'count'
  const totalOf = (value: string) =>
    sumReportValues(rows.filter(({keys}) => keys[1]?.value === value).map(({values}) => values[0]))
  return (
    <ul className='m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1 p-0 text-fg-secondary text-xs'>
      {series.map(({key, label, color}) => (
        <li key={key?.value ?? label} className='inline-flex items-center gap-1.5'>
          <span className={cn('size-2.5 shrink-0 rounded-xs', color.className)} />
          {label}
          {isCount && key && (
            <span className='tabular-nums'>{totalOf(key.value).toLocaleString()}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default ReportLegend
