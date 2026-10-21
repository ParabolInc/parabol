import {
  isReportTimeDimension,
  REPORT_MEASURES,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportKey, PARTIAL_STEP_NOTE} from './formatReportKey'
import {formatReportValue} from './formatReportValue'
import {distinctKeysAt, type ReportResultRow, sumReportValues} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
  isCompact: boolean
}

const COMPACT_ROW_COUNT = 8

// the share of the biggest value sets the shade, and the value is printed too so color never carries it alone
const heatClassName = (value: number | null, max: number) => {
  if (!value || max <= 0) return 'border border-hairline'
  const share = value / max
  if (share <= 1 / 3) return 'bg-grape-500/20'
  if (share <= 2 / 3) return 'bg-grape-500/40 dark:bg-grape-500/35'
  return 'bg-grape-500/70 dark:bg-grape-500/55'
}

const ReportHeatmapView = ({spec, step, rows, isCompact}: Props) => {
  const measure = spec.measures[0]!
  const dimensions = spec.breakdown.map(({dimension}) => dimension)
  const columnPosition = dimensions.length - 1
  const columns = distinctKeysAt(rows, columnPosition)
  const isCount = REPORT_MEASURES[measure].kind === 'count'
  const isDate = REPORT_MEASURES[measure].kind === 'latest'
  const gridRows = new Map<string, {name: string; cells: Map<string, number | null>}>()
  rows.forEach(({keys, values}) => {
    const rowKeys = keys.slice(0, columnPosition)
    const id = rowKeys.map(({value}) => value).join('|')
    const name = rowKeys
      .map((key, position) => formatReportKey(key, dimensions[position]!, step))
      .join(' › ')
    const gridRow = gridRows.get(id) ?? {name, cells: new Map()}
    gridRow.cells.set(keys[columnPosition]!.value, values[0] ?? null)
    gridRows.set(id, gridRow)
  })
  const max = isDate ? 0 : Math.max(0, ...rows.map(({values}) => values[0] ?? 0))
  const allRows = [...gridRows.entries()]
  const shownRows = isCompact ? allRows.slice(0, COMPACT_ROW_COUNT) : allRows
  const hasYearRow = step === 'MONTH' && isReportTimeDimension(dimensions[columnPosition]!)
  const yearOf = (columnIdx: number) => columns[columnIdx]?.label.slice(0, 4)
  return (
    <div className='flex flex-col gap-2'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-max border-separate border-spacing-1 text-sm'>
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
                  {formatReportKey(column, dimensions[columnPosition]!, step)}
                </th>
              ))}
              {isCount && !isCompact && <th className='min-w-12 pl-2 text-right'>Total</th>}
            </tr>
          </thead>
          <tbody>
            {shownRows.map(([id, {name, cells}]) => (
              <tr key={id}>
                <th scope='row' className='max-w-60 truncate pr-2 text-left font-normal'>
                  {name}
                </th>
                {columns.map((column) => {
                  const value = cells.get(column.value) ?? null
                  return (
                    <td key={column.value} className={cn(column.isPartial && 'opacity-60')}>
                      <span
                        className={cn(
                          'flex h-7 items-center justify-center rounded px-1 font-semibold text-xs tabular-nums',
                          heatClassName(value, max)
                        )}
                      >
                        {isDate ? formatReportValue(measure, value) : value || ''}
                      </span>
                    </td>
                  )
                })}
                {isCount && !isCompact && (
                  <td className='pl-2 text-right font-semibold tabular-nums'>
                    {sumReportValues([...cells.values()]).toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allRows.length > shownRows.length && (
        <span className='text-fg-muted text-xs'>
          {allRows.length - shownRows.length} more in the report
        </span>
      )}
    </div>
  )
}

export default ReportHeatmapView
