import type {ReportDimension} from '../../shared/reports/reportCatalog'
import {
  groupReportHeatmapRows,
  hasNothing,
  type ReportHeatmapRow,
  type ReportHeatmapValue,
  toReportHeatmapRowName
} from './reportHeatmapGrid'
import type {ReportTeamHealthCheck} from './reportTeamHealthCells'
import {formatAnsweredTogether} from './reportTeamHealthWords'

export interface ReportTogetherRow {
  readonly keys: readonly {readonly value: string}[]
  readonly values: readonly (number | null | undefined)[]
}

export interface ReportTeamHealthAllTeams {
  answered: string | null
  values: Map<string, ReportHeatmapValue>
  total: ReportHeatmapValue
}

export interface ReportTeamHealthAllTeamsRows {
  readonly allTeams: readonly ReportTogetherRow[]
  readonly allTeamsTotal: ReportTogetherRow | null | undefined
}

export interface ReportTeamHealthRowItem {
  kind: 'team' | 'level'
  id: string
  name: string
  row: ReportHeatmapRow
  // the team a team row shows, which names its cells
  teamId: string | null
  isNested: boolean
}

export interface ReportTeamHealthRowGroup {
  id: string
  label: string | null
  items: ReportTeamHealthRowItem[]
}

const toValue = (row: ReportTogetherRow | null | undefined): ReportHeatmapValue => ({
  value: row?.values[0] ?? null,
  previous: null
})

const lastKeyOf = ({keys}: ReportHeatmapRow) => keys[keys.length - 1]

// The rows of a Team Health heatmap, under a label for each value of the first breakdown when rows split twice, like
// by business unit then team. Rows with nothing in them are left out
export const toTeamHealthTable = (
  rowDimensions: readonly ReportDimension[],
  gridRows: readonly ReportHeatmapRow[],
  allTeamsRows: ReportTeamHealthAllTeamsRows,
  checkByTeamId: ReadonlyMap<string, ReportTeamHealthCheck>
) => {
  const isTeamRows = rowDimensions[rowDimensions.length - 1] === 'TEAM'
  const shownRows = gridRows.filter((row) => !hasNothing(row, false))
  const groups = groupReportHeatmapRows(shownRows).map(
    ({id, label, rows}): ReportTeamHealthRowGroup => ({
      id,
      label,
      items: rows.map((row) => ({
        kind: isTeamRows ? 'team' : 'level',
        id: row.id,
        name: toReportHeatmapRowName(row),
        row,
        teamId: isTeamRows ? (lastKeyOf(row)?.value ?? null) : null,
        isNested: label !== null
      }))
    })
  )
  const shownChecks = shownRows.flatMap((row) => {
    const check = isTeamRows ? checkByTeamId.get(lastKeyOf(row)?.value ?? '') : undefined
    return check ? [check] : []
  })
  const allTeams: ReportTeamHealthAllTeams = {
    answered: formatAnsweredTogether(shownChecks),
    values: new Map(allTeamsRows.allTeams.map((row) => [row.keys[0]?.value ?? '', toValue(row)])),
    total: toValue(allTeamsRows.allTeamsTotal)
  }
  const emptyNames = gridRows.filter((row) => hasNothing(row, false)).map(toReportHeatmapRowName)
  return {groups, allTeams, emptyNames: [...new Set(emptyNames)], isTeamRows}
}
