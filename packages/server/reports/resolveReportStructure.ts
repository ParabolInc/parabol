import {
  REPORT_STRUCTURE_LABELS,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED,
  type ReportDimension,
  type ReportSpec
} from '../../client/shared/reports/reportCatalog'
import {
  fromOrgStructureKey,
  isLevelDimension,
  type OrgStructure,
  REMOVED_LEVEL_DIMENSION,
  type ReportLevelDimension,
  toLevelDimension,
  toLevelId,
  toOrgStructureKey
} from './orgStructure'
import type {ReportMeasureResult, ReportQueryDimension} from './reportMeasureTypes'

const toValueKey = (valueId: number) => toOrgStructureKey(valueId, 'OrgStructureValue')

// SQL names a value by its id, which the API names by its key
const toClientKey = (key: string) =>
  key in REPORT_STRUCTURE_LABELS ? key : toValueKey(Number(key))

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
  const levelOf = (levelKey: string | undefined) => {
    const levelId = levelKey ? fromOrgStructureKey(levelKey, 'OrgStructureLevel') : null
    return structure.levels.find(({id}) => id === levelId) ?? null
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
  const valueIdOf = (teamId: string, levelId: number) =>
    structure.placements.find(
      (placement) => placement.teamId === teamId && placement.levelId === levelId
    )?.valueId
  const isTeamFiltered = (teamId: string) =>
    levelFilters.every(({level, values}) => {
      if (!level) return false
      const valueId = valueIdOf(teamId, level.id)
      return values.includes(valueId === undefined ? REPORT_STRUCTURE_NOT_SET : toValueKey(valueId))
    })
  // the values a level takes among the counted teams, in the level's order
  const valuesOf = (dimension: ReportLevelDimension, teamIds: string[]) => {
    const levelId = toLevelId(dimension)
    const level = structure.levels.find(({id}) => id === levelId)
    if (!level) {
      return [{value: REPORT_STRUCTURE_REMOVED, label: REPORT_STRUCTURE_LABELS.removed}]
    }
    const placedValueIds = new Set(teamIds.flatMap((teamId) => valueIdOf(teamId, level.id) ?? []))
    const values = level.values
      .filter(({id}) => placedValueIds.has(id))
      .map(({id, name}) => ({value: toValueKey(id), label: name}))
    const hasUnplacedTeam = teamIds.some((teamId) => valueIdOf(teamId, level.id) === undefined)
    return hasUnplacedTeam
      ? [...values, {value: REPORT_STRUCTURE_NOT_SET, label: REPORT_STRUCTURE_LABELS.notSet}]
      : values
  }
  // the value a team sits at on a level, as a report's keys name it
  const teamValueOf = (dimension: ReportLevelDimension, teamId: string) => {
    const levelId = toLevelId(dimension)
    if (!structure.levels.some(({id}) => id === levelId)) return REPORT_STRUCTURE_REMOVED
    const valueId = valueIdOf(teamId, levelId)
    return valueId === undefined ? REPORT_STRUCTURE_NOT_SET : toValueKey(valueId)
  }
  const levelNameOf = (dimension: ReportLevelDimension) =>
    structure.levels.find(({id}) => id === toLevelId(dimension))?.name ?? null
  return {
    breakdown: resolvedBreakdown,
    levelNameOf,
    removedBreakdownCount,
    removedFilterCount: levelFilters.filter(({level}) => !level).length,
    hasLevelFilters: levelFilters.length > 0,
    isTeamFiltered,
    valuesOf,
    teamValueOf
  }
}

export default resolveReportStructure
