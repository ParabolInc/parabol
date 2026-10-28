import {
  isReportAdditiveMeasure,
  REPORT_MEASURES,
  type ReportMeasure
} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportValue} from './formatReportValue'
import ReportDelta from './ReportDelta'
import ReportValue from './ReportValue'
import type {ReportHeatmapValue} from './reportHeatmapGrid'
import {heatClassName} from './reportHeatmapShades'
import {isHiddenReportValue} from './reportRows'

interface Props {
  measure: ReportMeasure
  cell: ReportHeatmapValue | undefined
  max: number
  isPartial: boolean
}

const ReportHeatmapCell = ({measure, cell, max, isPartial}: Props) => {
  const {kind} = REPORT_MEASURES[measure]
  const isHidden = isHiddenReportValue(cell?.value)
  const value = isHidden ? null : (cell?.value ?? null)
  const previous = isHiddenReportValue(cell?.previous) ? null : (cell?.previous ?? null)
  // an empty count is left blank, but a share, median or score of 0 says something
  const text = isReportAdditiveMeasure(measure)
    ? value || ''
    : value === null && kind !== 'latest'
      ? ''
      : formatReportValue(measure, value)
  return (
    <td className={cn(isPartial && 'opacity-60')}>
      <span
        className={cn(
          'flex min-h-7 flex-col items-center justify-center rounded px-1 py-0.5 font-semibold text-xs tabular-nums',
          heatClassName(kind, value, max)
        )}
      >
        {isHidden ? <ReportValue measure={measure} value={cell?.value} /> : text}
        {value !== null && previous !== null && value !== previous && (
          <ReportDelta
            change={value - previous}
            measure={measure}
            className='font-normal text-[11px]'
          />
        )}
      </span>
    </td>
  )
}

export default ReportHeatmapCell
