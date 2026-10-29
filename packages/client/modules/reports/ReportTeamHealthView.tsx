import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment, useQueryLoader} from 'react-relay'
import reportTeamHealthCellDetailsQuery, {
  type ReportTeamHealthCellDetailsQuery
} from '../../__generated__/ReportTeamHealthCellDetailsQuery.graphql'
import type {ReportTeamHealthView_teamHealth$key} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import useBreakpoint from '../../hooks/useBreakpoint'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Breakpoint} from '../../types/constEnums'
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
  const [cellQueryRef, loadCellQuery] = useQueryLoader<ReportTeamHealthCellDetailsQuery>(
    reportTeamHealthCellDetailsQuery
  )
  const isDrawer = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
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
  const onSelect = (key: string) => {
    const cell = shownCells.find((shownCell) => shownCell.key === key)
    if (key === selectedKey || !cell) {
      setSelectedKey(null)
      return
    }
    loadCellQuery(
      {orgId, meetingId: cell.check.meetingId, categoryId: cell.category.categoryId},
      {fetchPolicy: 'store-or-network'}
    )
    setSelectedKey(key)
  }
  return (
    <div className='@container flex flex-col gap-3'>
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
        onSelect={onSelect}
      />
      <ReportTeamHealthLegend
        comparison={spec.compareTo ? formatComparison(spec.compareTo) : null}
        isPreviousCheck={isPreviousCheck}
        emptyNames={emptyNames}
        isTeamRows={isTeamRows}
      />
      <ReportTeamHealthDetails
        selection={selection}
        queryRef={cellQueryRef}
        isDrawer={isDrawer}
        onClose={() => setSelectedKey(null)}
      />
    </div>
  )
}

export default ReportTeamHealthView
