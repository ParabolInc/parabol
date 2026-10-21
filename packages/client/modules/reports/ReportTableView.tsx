import {REPORT_MEASURES, type ReportSpec} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {formatReportKey, PARTIAL_STEP_NOTE} from './formatReportKey'
import {formatReportValue} from './formatReportValue'
import ReportDelta from './ReportDelta'
import {type ReportResultRow, sumReportValues} from './reportRows'
import {formatReportDimension, type ReportStepLength} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
}

const ReportTableView = ({spec, step, rows}: Props) => {
  const {measures, breakdown, compareTo} = spec
  const dimensions = breakdown.map(({dimension}) => dimension)
  const isCount = (measureIdx: number) => REPORT_MEASURES[measures[measureIdx]!].kind === 'count'
  const totals = measures.map((_, measureIdx) =>
    isCount(measureIdx) ? sumReportValues(rows.map(({values}) => values[measureIdx])) : null
  )
  const hasTotals = dimensions.length > 0 && rows.length > 1 && totals.some((t) => t !== null)
  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr className='border-hairline border-b text-fg-muted text-xs'>
            {dimensions.map((dimension) => (
              <th key={dimension} scope='col' className='py-2 pr-4 text-left font-semibold'>
                {formatReportDimension(dimension, step)}
              </th>
            ))}
            {measures.map((measure) => (
              <th key={measure} scope='col' className='py-2 pl-4 text-right font-semibold'>
                {REPORT_MEASURES[measure].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            const previousRow = rows[rowIdx - 1]
            const isPartial = row.keys.some(({isPartial}) => isPartial)
            return (
              <tr
                key={row.keys.map(({value}) => value).join('|')}
                className={cn('border-hairline border-b', isPartial && 'text-fg-muted')}
                title={isPartial ? PARTIAL_STEP_NOTE : undefined}
              >
                {row.keys.map((key, position) => {
                  const isSameGroup =
                    position < row.keys.length - 1 &&
                    !!previousRow &&
                    row.keys
                      .slice(0, position + 1)
                      .every(({value}, idx) => previousRow.keys[idx]?.value === value)
                  return position === 0 ? (
                    <th key={position} scope='row' className='py-2 pr-4 text-left font-normal'>
                      {isSameGroup ? '' : formatReportKey(key, dimensions[position]!, step, true)}
                    </th>
                  ) : (
                    <td key={position} className='py-2 pr-4'>
                      {isSameGroup ? '' : formatReportKey(key, dimensions[position]!, step, true)}
                    </td>
                  )
                })}
                {measures.map((measure, measureIdx) => {
                  const value = row.values[measureIdx] ?? null
                  const previousValue = row.previousValues?.[measureIdx] ?? null
                  return (
                    <td key={measure} className='py-2 pl-4 text-right tabular-nums'>
                      <span className='inline-flex flex-col items-end'>
                        {formatReportValue(measure, value)}
                        {compareTo && value !== null && previousValue !== null && (
                          <ReportDelta change={value - previousValue} />
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
        {hasTotals && (
          <tfoot>
            <tr className='font-bold'>
              <th
                scope='row'
                colSpan={dimensions.length}
                className='border-hairline-strong border-t py-2 pr-4 text-left'
              >
                All
              </th>
              {measures.map((measure, measureIdx) => (
                <td
                  key={measure}
                  className='border-hairline-strong border-t py-2 pl-4 text-right tabular-nums'
                >
                  {totals[measureIdx] === null
                    ? '—'
                    : formatReportValue(measure, totals[measureIdx])}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default ReportTableView
