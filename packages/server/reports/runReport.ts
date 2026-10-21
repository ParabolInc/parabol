import {GraphQLError} from 'graphql'
import {
  isReportTimeDimension,
  type ReportCategoryDimension,
  type ReportPeriod,
  type ReportSpec
} from '../../client/shared/reports/reportCatalog'
import {validateReportSpec} from '../../client/shared/reports/validateReportSpec'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {ReportNoteKindEnum} from '../graphql/public/resolverTypes'
import buildReportRows from './buildReportRows'
import getReportScope from './getReportScope'
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
import type {ReportMeasureFilter, ReportMeasureQuery} from './reportMeasureTypes'
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
  const [organization, scope] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    getReportScope({orgId, viewerId, isSuperUser, dataLoader})
  ])
  const range = resolveReportPeriod(spec.period, pagePeriod, {
    timeZone,
    now,
    orgCreatedAt: organization.createdAt
  })
  if (typeof range === 'string') throw new GraphQLError(range)

  const breakdown = spec.breakdown.map(({dimension}) => dimension)
  const timeDimension = breakdown.find(isReportTimeDimension)
  const stepLength: ReportStepLength | null = timeDimension
    ? chooseReportStepLength(timeDimension, range)
    : null
  const toSteps = (localRange: ReportLocalRange) => {
    const steps = buildReportSteps(localRange, stepLength, timeZone)
    if (typeof steps === 'string') throw new GraphQLError(steps)
    return steps
  }
  const steps = toSteps(range)

  const dimensions = breakdown.filter(
    (dimension): dimension is ReportCategoryDimension => !isReportTimeDimension(dimension)
  )
  const filters = spec.filters.filter(
    (filter): filter is ReportMeasureFilter => !isReportTimeDimension(filter.dimension)
  )
  const teamFilter = filters.find(({dimension}) => dimension === 'TEAM')
  const teams = teamFilter
    ? scope.teams.filter(({id}) => teamFilter.values.includes(id))
    : scope.teams
  const measureFilters = filters.filter(({dimension}) => dimension !== 'TEAM')
  const isWholeOrg = scope.canCountWholeOrg && !teamFilter && !dimensions.includes('TEAM')

  const queryMeasures = (measureSteps: ReportStep[]) =>
    Promise.all(
      spec.measures.map((measure) => {
        const query: ReportMeasureQuery = {
          measure,
          orgId,
          teamIds: teams.map(({id}) => id),
          isWholeOrg,
          stepStarts: measureSteps.map(({start}) => start),
          stepEnds: measureSteps.map(({end}) => end),
          readAt: measureSteps.map(({end}) => (end < now ? end : now)),
          dimensions,
          filters: measureFilters
        }
        return dataLoader.get('reportMeasureRows').load(query)
      })
    )
  const previousSteps = spec.compareTo ? toSteps(shiftReportRange(range, spec.compareTo)) : null
  const [current, previous] = await Promise.all([
    queryMeasures(steps),
    previousSteps ? queryMeasures(previousSteps) : null
  ])

  const rows = buildReportRows({
    breakdown,
    measures: spec.measures,
    steps: stepLength ? steps : null,
    previousStepCount: previousSteps?.length ?? 0,
    teams,
    filters: measureFilters,
    current,
    previous
  })
  if (typeof rows === 'string') throw new GraphQLError(rows)

  const matchingRows = applyReportConditions(rows, spec, now)
  const shapedRows = capReportSeries(
    limitReportRows(sortReportRows(matchingRows, spec), spec),
    spec
  )
  const notes: {kind: ReportNoteKindEnum; count: number}[] = []
  if (scope.leftOutTeamCount > 0) {
    notes.push({kind: 'STARTER_LIMIT', count: scope.leftOutTeamCount})
  }
  const estimatedCount = current.reduce((sum, result) => sum + result.estimatedCount, 0)
  if (estimatedCount > 0) notes.push({kind: 'ESTIMATED_HISTORY', count: estimatedCount})
  if (shapedRows.length > MAX_ROWS) {
    notes.push({kind: 'ROWS_TRUNCATED', count: shapedRows.length})
  }
  return {
    from: toInstant(range.startDate, timeZone),
    to: toInstant(range.endDate, timeZone),
    step: stepLength,
    rows: shapedRows.slice(0, MAX_ROWS),
    totalRowCount: matchingRows.length,
    teamCount: teams.length,
    notes
  }
}

export default runReport
