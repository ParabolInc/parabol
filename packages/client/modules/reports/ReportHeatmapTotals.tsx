import type {ReportHeatmapRow} from './reportHeatmapGrid'
import type {ReportResultKey} from './reportRows'
import {sumReportValues} from './reportRows'

interface Props {
  columns: ReportResultKey[]
  rows: ReportHeatmapRow[]
  hasRowTotals: boolean
  hasLastHeld: boolean
}

// The count in each column across the rows, which only counts can add up
const ReportHeatmapTotals = ({columns, rows, hasRowTotals, hasLastHeld}: Props) => (
  <tfoot>
    <tr className='font-semibold tabular-nums'>
      <th scope='row' className='border-hairline-strong border-t pt-1 pr-2 text-left'>
        All
      </th>
      {columns.map((column) => (
        <td key={column.value} className='border-hairline-strong border-t pt-1 text-center text-xs'>
          {sumReportValues(rows.map(({cells}) => cells.get(column.value)?.value)).toLocaleString()}
        </td>
      ))}
      {hasRowTotals && (
        <td className='border-hairline-strong border-t pt-1 pl-2 text-right'>
          {sumReportValues(rows.map(({total}) => total?.value)).toLocaleString()}
        </td>
      )}
      {hasLastHeld && <td className='border-hairline-strong border-t' />}
    </tr>
  </tfoot>
)

export default ReportHeatmapTotals
