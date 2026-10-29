import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_MEASURES,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import plural from '../../utils/plural'
import ReportHeatmapHeader from './ReportHeatmapHeader'
import ReportHeatmapLegend from './ReportHeatmapLegend'
import ReportHeatmapRow from './ReportHeatmapRow'
import ReportHeatmapTotals from './ReportHeatmapTotals'
import {
  hasNothing,
  type ReportRowTotal,
  toReportHeatmapGrid,
  toTotalHeading
} from './reportHeatmapGrid'
import {type ReportResultRow, sumReportValues} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  rows: readonly ReportResultRow[]
  rowTotals: readonly ReportRowTotal[]
  isCompact: boolean
  lastHeldByTeamId?: ReadonlyMap<string, number | null>
}

const COMPACT_ROW_COUNT = 8

const ReportHeatmapView = ({spec, step, rows, rowTotals, isCompact, lastHeldByTeamId}: Props) => {
  const measure = spec.measures[0]!
  const {kind, label} = REPORT_MEASURES[measure]
  const dimensions = spec.breakdown.map(({dimension}) => dimension)
  const columnDimension = dimensions[dimensions.length - 1]!
  const isOverTime = isReportTimeDimension(columnDimension)
  const {columns, rows: gridRows} = toReportHeatmapGrid(dimensions, step, rows, rowTotals)
  // a page lists the teams with nothing below the table, instead of giving each an empty row
  const isTeamRows = dimensions.length === 2 && dimensions[0] === 'TEAM'
  const emptyRows =
    !isCompact && isTeamRows
      ? gridRows.filter((row) => hasNothing(row, isReportAdditiveMeasure(measure)))
      : []
  const listedRows = gridRows.filter((row) => !emptyRows.includes(row))
  const shownRows = isCompact ? listedRows.slice(0, COMPACT_ROW_COUNT) : listedRows
  const max = kind === 'latest' ? 0 : Math.max(0, ...rows.map(({values}) => values[0] ?? 0))
  const hasTotals = !isCompact && rowTotals.length > 0
  const isCount = kind === 'count'
  return (
    <div className='flex flex-col gap-3'>
      {!isCompact && isCount && isTeamRows && (
        <p className='m-0 text-fg-secondary text-sm'>
          {sumReportValues(listedRows.map(({total}) => total?.value)).toLocaleString()}{' '}
          {label.toLowerCase()} across {listedRows.length} of {gridRows.length}{' '}
          {plural(gridRows.length, 'team')}
        </p>
      )}
      <div className='overflow-x-auto'>
        <table className='w-full min-w-max border-separate border-spacing-1 text-sm'>
          <ReportHeatmapHeader
            columns={columns}
            columnDimension={columnDimension}
            step={step}
            hasYearRow={step === 'MONTH' && isOverTime}
            totalHeading={hasTotals ? toTotalHeading(measure, isOverTime) : null}
            hasLastHeld={!!lastHeldByTeamId}
          />
          <tbody>
            {shownRows.map((row) => (
              <ReportHeatmapRow
                key={row.id}
                row={row}
                columns={columns}
                measure={measure}
                max={max}
                hasTotal={hasTotals}
                lastHeld={lastHeldByTeamId ? (lastHeldByTeamId.get(row.id) ?? null) : undefined}
              />
            ))}
          </tbody>
          {!isCompact && isCount && listedRows.length > 1 && (
            <ReportHeatmapTotals
              columns={columns}
              rows={listedRows}
              hasRowTotals={hasTotals}
              hasLastHeld={!!lastHeldByTeamId}
            />
          )}
        </table>
      </div>
      {listedRows.length > shownRows.length && (
        <span className='text-fg-muted text-xs'>
          {listedRows.length - shownRows.length} more in the report
        </span>
      )}
      {!isCompact && (
        <ReportHeatmapLegend
          measure={measure}
          max={max}
          emptyTeamNames={emptyRows.map(({name}) => name)}
        />
      )}
    </div>
  )
}

export default ReportHeatmapView
