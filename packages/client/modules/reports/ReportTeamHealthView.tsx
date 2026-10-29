import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {ReportTeamHealthView_teamHealth$key} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import useResizeObserver from '../../hooks/useResizeObserver'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import formatComparison from './formatComparison'
import ReportTeamHealthDetails from './ReportTeamHealthDetails'
import ReportTeamHealthLegend from './ReportTeamHealthLegend'
import ReportTeamHealthSummary from './ReportTeamHealthSummary'
import ReportTeamHealthTable from './ReportTeamHealthTable'
import {type ReportRowTotal, toReportHeatmapGrid} from './reportHeatmapGrid'
import type {ReportResultRow} from './reportRows'
import {markReportTeamHealthCells, toTeamHealthCellKey} from './reportTeamHealthCells'
import {type ReportTeamHealthAllTeamsRows, toTeamHealthTable} from './reportTeamHealthRows'

interface Props {
  orgId: string
  spec: ReportSpec
  rowHeading: string
  rows: readonly ReportResultRow[]
  rowTotals: readonly ReportRowTotal[]
  teamHealthRef: ReportTeamHealthView_teamHealth$key
  allTeamsRows: ReportTeamHealthAllTeamsRows
}

// below this, the selected cell opens in a bottom sheet rather than beside the table
const SIDE_PANEL_MIN_WIDTH = 1024

const ReportTeamHealthView = (props: Props) => {
  const {orgId, spec, rowHeading, rows, rowTotals, teamHealthRef, allTeamsRows} = props
  const teamHealth = useFragment(
    graphql`
      fragment ReportTeamHealthView_teamHealth on ReportTeamHealth {
        checks {
          meetingId
          teamId
          endedAt
          checkNumber
          respondentCount
          memberCount
          categories {
            categoryId
            respondentCount
            commenterCount
            deviation
            sentimentScore
            isLoadingSummary
            previousScores
          }
        }
      }
    `,
    teamHealthRef
  )
  const {checks} = teamHealth
  const cells = useMemo(() => markReportTeamHealthCells(checks), [checks])
  const checkByTeamId = useMemo(
    () => new Map(checks.map((check) => [check.teamId, check])),
    [checks]
  )
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const [viewWidth, setViewWidth] = useState(0)
  useResizeObserver(([entry]) => setViewWidth(entry!.contentRect.width), viewRef)
  const dimensions = spec.breakdown.map(({dimension}) => dimension)
  const {columns, rows: gridRows} = toReportHeatmapGrid(dimensions, null, rows, rowTotals)
  const {groups, allTeams, emptyNames, isTeamRows} = toTeamHealthTable(
    dimensions.slice(0, -1),
    gridRows,
    allTeamsRows,
    checkByTeamId
  )
  const teamItems = groups.flatMap(({items}) =>
    items.flatMap((item) => (item.kind === 'team' && item.teamId ? [item] : []))
  )
  const shownCells = teamItems.flatMap(({teamId}) =>
    columns.flatMap((column) => cells.get(toTeamHealthCellKey(teamId!, column.value)) ?? [])
  )
  const selectedCell = shownCells.find(({key}) => key === selectedKey)
  const teamName = teamItems.find(({teamId}) => teamId === selectedCell?.check.teamId)?.name
  const categoryName = columns.find(({value}) => value === selectedCell?.category.categoryId)?.label
  const selection =
    selectedCell && teamName && categoryName ? {cell: selectedCell, teamName, categoryName} : null
  const isPreviousCheck = spec.compareTo === 'PREVIOUS_CHECK'
  return (
    <div ref={viewRef} className='flex items-start gap-5'>
      <div className='@container flex min-w-0 flex-1 flex-col gap-3'>
        <ReportTeamHealthSummary shownCells={shownCells} hasTeamRows={isTeamRows} />
        <ReportTeamHealthTable
          columns={columns}
          rowHeading={rowHeading}
          hasAnsweredColumn={isTeamRows}
          allTeams={allTeams}
          groups={groups}
          checkByTeamId={checkByTeamId}
          cells={cells}
          isPreviousCheck={isPreviousCheck}
          selectedKey={selection && selectedKey}
          onSelect={(key) => setSelectedKey(key === selectedKey ? null : key)}
        />
        <ReportTeamHealthLegend
          comparison={spec.compareTo ? formatComparison(spec.compareTo) : null}
          isPreviousCheck={isPreviousCheck}
          emptyNames={emptyNames}
          isTeamRows={isTeamRows}
        />
      </div>
      <ReportTeamHealthDetails
        orgId={orgId}
        selection={selection}
        isSidePanel={viewWidth >= SIDE_PANEL_MIN_WIDTH}
        onClose={() => setSelectedKey(null)}
      />
    </div>
  )
}

export default ReportTeamHealthView
