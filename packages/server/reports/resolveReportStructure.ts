import {
  REPORT_STRUCTURE_LABELS,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED,
  type ReportDimension,
  type ReportSpec
} from '../../client/shared/reports/reportCatalog'
import {
  isLevelDimension,
  type OrgStructure,
  REMOVED_LEVEL_DIMENSION,
  type ReportLevelDimension,
  toLevelDimension,
  toLevelRowId,
  toOrgStructureId,
  toOrgStructureRowId
} from './orgStructure'
import type {ReportMeasureResult, ReportQueryDimension} from './reportMeasureTypes'

const toValueId = (valueRowId: number) => toOrgStructureId(valueRowId, 'OrgStructureValue')

// SQL names a value by its row, which the API names by its id
const toClientKey = (key: string) => (key in REPORT_STRUCTURE_LABELS ? key : toValueId(Number(key)))

export const toClientLevelKeys = (
  result: ReportMeasureResult,
  dimensions: ReportQueryDimension[]
): ReportMeasureResult =>
  dimensions.some(isLevelDimension)
    ? {
        ...result,
        rows: result.rows.map((row) => ({
          ...row,
          keys: row.keys.map((key, idx) =>
            isLevelDimension(dimensions[idx] ?? 'TEAM') ? toClientKey(key) : key
          )
        }))
      }
    : result

// The org structure levels a report splits and filters by. A breakdown on a removed level shows teams
// instead, or one group when the report already splits by team. A filter on a removed level stops the
// report, so its results never widen
const resolveReportStructure = ({breakdown, filters}: ReportSpec, structure: OrgStructure) => {
  const levelOf = (levelId: string | undefined) => {
    const rowId = levelId ? toOrgStructureRowId(levelId, 'OrgStructureLevel') : null
    return structure.levels.find(({id}) => id === rowId) ?? null
  }
  let isTeamUsed = breakdown.some(({dimension}) => dimension === 'TEAM')
  let removedBreakdownCount = 0
  const resolvedBreakdown = breakdown.map(
    ({dimension, levelId}): ReportDimension | ReportLevelDimension => {
      if (dimension !== 'TEAM_LEVEL') return dimension
      const level = levelOf(levelId)
      if (level) return toLevelDimension(level.id)
      removedBreakdownCount++
      if (isTeamUsed) return REMOVED_LEVEL_DIMENSION
      isTeamUsed = true
      return 'TEAM'
    }
  )
  const levelFilters = filters.flatMap(({dimension, levelId, values}) =>
    dimension === 'TEAM_LEVEL' ? [{level: levelOf(levelId), values}] : []
  )
  const valueIdOf = (teamId: string, levelRowId: number) =>
    structure.placements.find(
      (placement) => placement.teamId === teamId && placement.levelId === levelRowId
    )?.valueId
  const isTeamFiltered = (teamId: string) =>
    levelFilters.every(({level, values}) => {
      if (!level) return false
      const valueRowId = valueIdOf(teamId, level.id)
      return values.includes(
        valueRowId === undefined ? REPORT_STRUCTURE_NOT_SET : toValueId(valueRowId)
      )
    })
  // the values a level takes among the counted teams, in the level's order
  const valuesOf = (dimension: ReportLevelDimension, teamIds: string[]) => {
    const levelRowId = toLevelRowId(dimension)
    const level = structure.levels.find(({id}) => id === levelRowId)
    if (!level) {
      return [{value: REPORT_STRUCTURE_REMOVED, label: REPORT_STRUCTURE_LABELS.removed}]
    }
    const placedValueIds = new Set(teamIds.flatMap((teamId) => valueIdOf(teamId, level.id) ?? []))
    const values = level.values
      .filter(({id}) => placedValueIds.has(id))
      .map(({id, name}) => ({value: toValueId(id), label: name}))
    const hasUnplacedTeam = teamIds.some((teamId) => valueIdOf(teamId, level.id) === undefined)
    return hasUnplacedTeam
      ? [...values, {value: REPORT_STRUCTURE_NOT_SET, label: REPORT_STRUCTURE_LABELS.notSet}]
      : values
  }
  const levelNameOf = (dimension: ReportLevelDimension) =>
    structure.levels.find(({id}) => id === toLevelRowId(dimension))?.name ?? null
  return {
    breakdown: resolvedBreakdown,
    levelNameOf,
    removedBreakdownCount,
    removedFilterCount: levelFilters.filter(({level}) => !level).length,
    hasLevelFilters: levelFilters.length > 0,
    isTeamFiltered,
    valuesOf
  }
}

export default resolveReportStructure
