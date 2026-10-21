import {REPORT_MEASURES, type ReportMeasure} from '../../shared/reports/reportCatalog'
import {formatReportValue} from './formatReportValue'
import ReportHeatmapCell from './ReportHeatmapCell'
import type {ReportHeatmapRow as ReportHeatmapRowData} from './reportHeatmapGrid'
import type {ReportResultKey} from './reportRows'

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
      <th scope='row' className='max-w-60 truncate pr-2 text-left font-normal'>
        {row.name}
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
          />
        ) : (
          <td className='pl-2 text-right font-semibold tabular-nums'>
            {kind === 'count' || kind === 'distinct'
              ? (total?.value ?? 0).toLocaleString()
              : formatReportValue(measure, total?.value)}
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
