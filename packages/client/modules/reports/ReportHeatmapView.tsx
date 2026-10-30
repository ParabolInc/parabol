import {useRef} from 'react'
import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_MEASURES,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import ReportHeatmapGroupLabel from './ReportHeatmapGroupLabel'
import ReportHeatmapHeader from './ReportHeatmapHeader'
import ReportHeatmapLegend from './ReportHeatmapLegend'
import ReportHeatmapRow from './ReportHeatmapRow'
import ReportHeatmapTotals from './ReportHeatmapTotals'
import {
  groupReportHeatmapRows,
  hasNothing,
  type ReportRowTotal,
  toReportHeatmapGrid,
  toReportHeatmapRowName,
  toTotalHeading
} from './reportHeatmapGrid'
import {type ReportResultRow, sumReportValues} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'
import useHideTotalWithoutRoom from './useHideTotalWithoutRoom'

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
  const rowDimensions = dimensions.slice(0, -1)
  const isTeamRows =
    rowDimensions[rowDimensions.length - 1] === 'TEAM' &&
    rowDimensions.every((dimension) => dimension === 'TEAM' || dimension === 'TEAM_LEVEL')
  const emptyRows =
    !isCompact && isTeamRows
      ? gridRows.filter((row) => hasNothing(row, isReportAdditiveMeasure(measure)))
      : []
  const listedRows = gridRows.filter((row) => !emptyRows.includes(row))
  const shownRows = isCompact ? listedRows.slice(0, COMPACT_ROW_COUNT) : listedRows
  const max = kind === 'latest' ? 0 : Math.max(0, ...rows.map(({values}) => values[0] ?? 0))
  const hasTotals = rowTotals.length > 0
  const scrollRef = useRef<HTMLDivElement>(null)
  useHideTotalWithoutRoom(scrollRef, isCompact && hasTotals)
  const isCount = kind === 'count'
  return (
    <div className='flex flex-col gap-3'>
      {!isCompact && isCount && isTeamRows && (
        <p className='m-0 text-fg-secondary text-sm'>
          {sumReportValues(listedRows.map(({total}) => total?.value)).toLocaleString()}{' '}
          {label.toLowerCase()}
        </p>
      )}
      <div ref={scrollRef} className='overflow-x-auto'>
        <table className='w-max max-w-full border-separate border-spacing-1 text-sm data-[hide-total]:[&_[data-total]]:hidden'>
          <ReportHeatmapHeader
            columns={columns}
            columnDimension={columnDimension}
            step={step}
            hasYearRow={step === 'MONTH' && isOverTime}
            totalHeading={hasTotals ? toTotalHeading(measure, isOverTime) : null}
            hasLastHeld={!!lastHeldByTeamId}
          />
          {groupReportHeatmapRows(shownRows).map((group) => (
            <tbody key={group.id}>
              {group.label !== null && (
                <ReportHeatmapGroupLabel
                  label={group.label}
                  colSpan={1 + columns.length + Number(hasTotals) + Number(!!lastHeldByTeamId)}
                />
              )}
              {group.rows.map((row) => (
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
          ))}
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
          emptyTeamNames={emptyRows.map(toReportHeatmapRowName)}
        />
      )}
    </div>
  )
}

export default ReportHeatmapView
