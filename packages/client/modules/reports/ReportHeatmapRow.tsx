import {REPORT_MEASURES, type ReportMeasure} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportValue} from './formatReportValue'
import ReportHeatmapCell from './ReportHeatmapCell'
import ReportValue from './ReportValue'
import {
  type ReportHeatmapRow as ReportHeatmapRowData,
  toReportHeatmapRowName
} from './reportHeatmapGrid'
import {isHiddenReportValue, type ReportResultKey} from './reportRows'

interface Props {
  row: ReportHeatmapRowData
  columns: ReportResultKey[]
  measure: ReportMeasure
  max: number
  hasTotal: boolean
  // when the row's team last held the meetings counted, or undefined without that column
  lastHeld: number | null | undefined
}

const ReportHeatmapRow = ({row, columns, measure, max, hasTotal, lastHeld}: Props) => {
  const {kind} = REPORT_MEASURES[measure]
  const {total} = row
  return (
    <tr>
      <th
        scope='row'
        className={cn(
          'max-w-60 truncate pr-2 text-left font-normal',
          row.keys.length > 1 && 'pl-3'
        )}
      >
        {toReportHeatmapRowName(row)}
      </th>
      {columns.map((column) => (
        <ReportHeatmapCell
          key={column.value}
          measure={measure}
          cell={row.cells.get(column.value)}
          max={max}
          isPartial={column.isPartial}
        />
      ))}
      {hasTotal &&
        (kind === 'score' || kind === 'share' || kind === 'median' ? (
          <ReportHeatmapCell
            measure={measure}
            cell={total ?? undefined}
            max={max}
            isPartial={false}
            isTotal
          />
        ) : (
          <td data-total className='pl-2 text-right font-semibold tabular-nums'>
            {(kind === 'count' || kind === 'distinct') && !isHiddenReportValue(total?.value) ? (
              (total?.value ?? 0).toLocaleString()
            ) : (
              <ReportValue measure={measure} value={total?.value} />
            )}
          </td>
        ))}
      {lastHeld !== undefined && (
        <td className='whitespace-nowrap pl-2 text-fg-secondary tabular-nums'>
          {formatReportValue('LAST_MEETING', lastHeld)}
        </td>
      )}
    </tr>
  )
}

export default ReportHeatmapRow
