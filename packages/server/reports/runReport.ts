import {GraphQLError} from 'graphql'
import {
  isReportTimeDimension,
  type ReportDimension,
  type ReportPeriod,
  type ReportSpec
} from '../../client/shared/reports/reportCatalog'
import {validateReportSpec} from '../../client/shared/reports/validateReportSpec'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {ReportNoteKindEnum} from '../graphql/public/resolverTypes'
import buildReportRows from './buildReportRows'
import getReportScope from './getReportScope'
import {isLevelDimension, type ReportLevelDimension} from './orgStructure'
import {
  buildReportSteps,
  chooseReportStepLength,
  isTimeZone,
  type ReportLocalRange,
  type ReportStep,
  type ReportStepLength,
  resolveReportPeriod,
  shiftReportRange,
  toInstant
} from './reportCalendar'
import type {
  ReportMeasureFilter,
  ReportMeasureQuery,
  ReportQueryDimension
} from './reportMeasureTypes'
import resolveReportStructure, {toClientLevelKeys} from './resolveReportStructure'
import {
  applyReportConditions,
  capReportSeries,
  limitReportRows,
  sortReportRows
} from './shapeReportRows'

const MAX_ROWS = 5000

interface Options {
  orgId: string
  spec: ReportSpec
  timeZone: string
  pagePeriod: ReportPeriod | null
  viewerId: string
  isSuperUser: boolean
  dataLoader: DataLoaderWorker
}

const runReport = async ({
  orgId,
  spec,
  timeZone,
  pagePeriod,
  viewerId,
  isSuperUser,
  dataLoader
}: Options) => {
  const specError = validateReportSpec(spec)
  if (specError) throw new GraphQLError(specError)
  if (!isTimeZone(timeZone)) throw new GraphQLError(`${timeZone} isn't a time zone`)

  const now = new Date()
  const [organization, scope, orgStructure] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    getReportScope({orgId, viewerId, isSuperUser, dataLoader}),
    dataLoader.get('orgStructureByOrgId').load(orgId)
  ])
  const range = resolveReportPeriod(spec.period, pagePeriod, {
    timeZone,
    now,
    orgCreatedAt: organization.createdAt
  })
  if (typeof range === 'string') throw new GraphQLError(range)

  const structure = resolveReportStructure(spec, orgStructure)
  const {breakdown} = structure
  const isTimeDimension = (dimension: ReportDimension | ReportQueryDimension) =>
    !isLevelDimension(dimension) && isReportTimeDimension(dimension)
  const timeDimension = spec.breakdown.map(({dimension}) => dimension).find(isReportTimeDimension)
  const stepLength: ReportStepLength | null = timeDimension
    ? chooseReportStepLength(timeDimension, range)
    : null
  const toSteps = (localRange: ReportLocalRange, length: ReportStepLength | null) => {
    const steps = buildReportSteps(localRange, length, timeZone)
    if (typeof steps === 'string') throw new GraphQLError(steps)
    return steps
  }

  const resultBreakdown = breakdown.map((dimension) =>
    isLevelDimension(dimension)
      ? {dimension: 'TEAM_LEVEL' as const, levelName: structure.levelNameOf(dimension)}
      : {dimension, levelName: null}
  )
  if (structure.removedFilterCount > 0) {
    return {
      from: toInstant(range.startDate, timeZone),
      to: toInstant(range.endDate, timeZone),
      step: stepLength,
      breakdown: resultBreakdown,
      rows: [],
      rowTotals: [],
      totalRowCount: 0,
      teamCount: 0,
      notes: [{kind: 'FILTER_LEVEL_REMOVED' as const, count: structure.removedFilterCount}]
    }
  }

  const dimensions = breakdown.filter(
    (dimension): dimension is ReportQueryDimension => !isTimeDimension(dimension)
  )
  // team and org structure filters pick which teams are counted
  const filters = spec.filters.flatMap(({dimension, values}): ReportMeasureFilter[] =>
    isReportTimeDimension(dimension) || dimension === 'TEAM_LEVEL' ? [] : [{dimension, values}]
  )
  const teamFilter = filters.find(({dimension}) => dimension === 'TEAM')
  const filteredTeams = scope.teams.filter(
    ({id}) => (!teamFilter || teamFilter.values.includes(id)) && structure.isTeamFiltered(id)
  )
  // topics are what teams talked about, so they only come from the teams the viewer is on
  const usesTopics = [...dimensions, ...filters.map(({dimension}) => dimension)].includes('TOPIC')
  const teams = usesTopics
    ? filteredTeams.filter(({id}) => scope.ownTeamIds.includes(id))
    : filteredTeams
  const measureFilters = filters.filter(({dimension}) => dimension !== 'TEAM')
  const isWholeOrg =
    scope.canCountWholeOrg &&
    !teamFilter &&
    !structure.hasLevelFilters &&
    !usesTopics &&
    !dimensions.some((dimension) => dimension === 'TEAM' || isLevelDimension(dimension))

  const queryMeasures = (
    measureSteps: ReportStep[],
    check: ReportMeasureQuery['check'],
    measureDimensions: ReportQueryDimension[],
    hasTimeSteps: boolean
  ) =>
    Promise.all(
      spec.measures.map((measure) => {
        const query: ReportMeasureQuery = {
          measure,
          orgId,
          teamIds: teams.map(({id}) => id),
          ownTeamIds: scope.ownTeamIds,
          isWholeOrg,
          stepStarts: measureSteps.map(({start}) => start),
          stepEnds: measureSteps.map(({end}) => end),
          readAt: measureSteps.map(({end}) => (end < now ? end : now)),
          hasTimeSteps,
          check,
          dimensions: measureDimensions,
          filters: measureFilters
        }
        return dataLoader
          .get('reportMeasureRows')
          .load(query)
          .then((result) => toClientLevelKeys(result, measureDimensions))
      })
    )
  const {compareTo} = spec
  // Every measure split by a breakdown, with its comparison. Each team's previous check is read over the
  // same steps; every other comparison shifts the period
  const measureBy = async (measureBreakdown: (ReportDimension | ReportLevelDimension)[]) => {
    const isOverTime = measureBreakdown.some(isTimeDimension)
    const toMeasureSteps = (localRange: ReportLocalRange) =>
      toSteps(localRange, isOverTime ? stepLength : null)
    const measureSteps = toMeasureSteps(range)
    const previousSteps = !compareTo
      ? null
      : compareTo === 'PREVIOUS_CHECK'
        ? measureSteps
        : toMeasureSteps(shiftReportRange(range, compareTo))
    const measureDimensions = dimensions.filter((dimension) => measureBreakdown.includes(dimension))
    const [current, previous] = await Promise.all([
      queryMeasures(measureSteps, 'latest', measureDimensions, isOverTime),
      previousSteps
        ? queryMeasures(
            previousSteps,
            compareTo === 'PREVIOUS_CHECK' ? 'previous' : 'latest',
            measureDimensions,
            isOverTime
          )
        : null
    ])
    const measuredRows = buildReportRows({
      breakdown: measureBreakdown,
      measures: spec.measures,
      steps: isOverTime ? measureSteps : null,
      previousStepCount: previousSteps?.length ?? 0,
      teams,
      filters: measureFilters,
      current,
      previous,
      levelValuesOf: (dimension) =>
        structure.valuesOf(
          dimension,
          teams.map(({id}) => id)
        )
    })
    if (typeof measuredRows === 'string') throw new GraphQLError(measuredRows)
    return {rows: measuredRows, current}
  }
  // A heatmap's last column is each row's own total, which the measure works out, since a share, median or
  // score can't be added up from its cells
  const [{rows, current}, rowTotals] = await Promise.all([
    measureBy(breakdown),
    spec.showAs === 'HEATMAP' ? measureBy(breakdown.slice(0, -1)) : null
  ])

  const matchingRows = applyReportConditions(rows, spec, now)
  const shapedRows = capReportSeries(
    limitReportRows(sortReportRows(matchingRows, spec), spec),
    spec
  )
  const notes: {kind: ReportNoteKindEnum; count: number}[] = []
  if (scope.leftOutTeamCount > 0) {
    notes.push({kind: 'STARTER_LIMIT', count: scope.leftOutTeamCount})
  }
  if (filteredTeams.length > teams.length) {
    notes.push({kind: 'TOPICS_FROM_OWN_TEAMS', count: filteredTeams.length - teams.length})
  }
  if (structure.removedBreakdownCount > 0) {
    notes.push({kind: 'STRUCTURE_LEVEL_REMOVED', count: structure.removedBreakdownCount})
  }
  const hiddenTeamIds = new Set(current.flatMap((result) => result.hiddenTeamIds))
  if (hiddenTeamIds.size > 0) notes.push({kind: 'HIDDEN_FOR_ANONYMITY', count: hiddenTeamIds.size})
  const estimatedCount = current.reduce((sum, result) => sum + result.estimatedCount, 0)
  if (estimatedCount > 0) notes.push({kind: 'ESTIMATED_HISTORY', count: estimatedCount})
  if (shapedRows.length > MAX_ROWS) {
    notes.push({kind: 'ROWS_TRUNCATED', count: shapedRows.length})
  }
  return {
    from: toInstant(range.startDate, timeZone),
    to: toInstant(range.endDate, timeZone),
    step: stepLength,
    breakdown: resultBreakdown,
    rows: shapedRows.slice(0, MAX_ROWS),
    rowTotals: rowTotals?.rows ?? [],
    totalRowCount: matchingRows.length,
    teamCount: teams.length,
    notes
  }
}

export default runReport
