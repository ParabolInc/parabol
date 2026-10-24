import type {ReportDimension} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportKey, PARTIAL_STEP_NOTE} from './formatReportKey'
import type {ReportResultKey} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

interface Props {
  columns: ReportResultKey[]
  columnDimension: ReportDimension
  step: ReportStepLength | null | undefined
  hasYearRow: boolean
  totalHeading: string | null
  hasLastHeld: boolean
}

const ReportHeatmapHeader = ({
  columns,
  columnDimension,
  step,
  hasYearRow,
  totalHeading,
  hasLastHeld
}: Props) => {
  const yearOf = (columnIdx: number) => columns[columnIdx]?.label.slice(0, 4)
  return (
    <thead>
      <tr className='text-fg-muted text-xs'>
        <td />
        {columns.map((column, columnIdx) => (
          <th
            key={column.value}
            scope='col'
            title={column.isPartial ? PARTIAL_STEP_NOTE : undefined}
            className={cn('min-w-10 font-semibold', column.isPartial && 'opacity-60')}
          >
            {hasYearRow && (
              <span
                className={cn(
                  'block font-normal text-[11px]',
                  yearOf(columnIdx) === yearOf(columnIdx - 1) && 'invisible'
                )}
              >
                {yearOf(columnIdx)}
              </span>
            )}
            {formatReportKey(column, columnDimension, step)}
          </th>
        ))}
        {totalHeading && (
          <th scope='col' className='min-w-12 pl-2 text-right'>
            {totalHeading}
          </th>
        )}
        {hasLastHeld && (
          <th scope='col' className='pl-2 text-left'>
            Last held
          </th>
        )}
      </tr>
    </thead>
  )
}

export default ReportHeatmapHeader
