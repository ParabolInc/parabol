import {
  type AliasableExpression,
  type Compilable,
  type Expression,
  expressionBuilder,
  type SelectQueryBuilder,
  type SqlBool,
  sql
} from 'kysely'
import {
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED,
  type ReportCategoryDimension
} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import type {DB} from '../postgres/types/pg'
import {isLevelDimension, toLevelId} from './orgStructure'
import type {
  ReportDimensionLabels,
  ReportMeasureFilter,
  ReportMeasureQuery,
  ReportMeasureResult,
  ReportQueryDimension
} from './reportMeasureTypes'

const STATEMENT_TIMEOUT_MS = 15000

type ReportDimensionExpressions = Partial<
  Record<ReportCategoryDimension, AliasableExpression<string | null>>
>

type ReportDimensionConditions = Partial<Record<ReportCategoryDimension, Expression<SqlBool>>>

interface ReportSource {
  where: Expression<SqlBool>[]
  dimensions: ReportDimensionExpressions
  labels?: ReportDimensionExpressions
  // what a row needs to count when the report splits or filters by a dimension, like a topic to be named by
  requires?: ReportDimensionConditions
  value: AliasableExpression<number | null>
  // how many of the counted rows rely on an estimated done date
  estimated?: Expression<number>
}

interface ReportQueryRow {
  stepIndex: number
  value: number | null
  estimated: number
  [dimensionKey: string]: unknown
}

interface ReadingStep {
  readAt: Date
  index: number
}

const eb = expressionBuilder<DB>()
const readingStep = expressionBuilder<{Step: ReadingStep}, 'Step'>()

const toTextArray = (values: string[]) => eb.cast<string[]>(eb.val(values), sql`text[]`)

export const toTimestampArray = (dates: Date[]) =>
  eb.cast<Date[]>(eb.val(dates), sql`timestamptz[]`)

export const isAnyOf = (expression: Expression<string | null>, values: string[]) =>
  eb(expression, '=', eb.fn.any(toTextArray(values)))

export const toEpochMilliseconds = (time: Expression<Date | null>) =>
  eb.cast<number>(eb(sql<number>`extract(epoch FROM ${time})`, '*', eb.lit(1000)), 'float8')

const executeReportQuery = async (query: Compilable<ReportQueryRow>) =>
  getKysely()
    .transaction()
    .execute(async (trx) => {
      await sql.raw(`SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`).execute(trx)
      const {rows} = await trx.executeQuery(query)
      return rows
    })

// An org structure level splits by the value each row's team sits at
const dimensionExpression = (
  expressions: ReportDimensionExpressions,
  dimension: ReportQueryDimension
) => {
  if (!isLevelDimension(dimension)) {
    const expression = expressions[dimension]
    if (!expression) throw new Error(`This measure can't be split by ${dimension}`)
    return expression
  }
  const team = expressions.TEAM
  if (!team) throw new Error(`This measure can't be split by ${dimension}`)
  const levelId = toLevelId(dimension)
  if (levelId === 0) return eb.val<string>(REPORT_STRUCTURE_REMOVED)
  return eb.fn.coalesce(
    eb
      .selectFrom('OrgStructurePlacement as p')
      .select(({cast}) => cast<string>('p.valueId', 'text').as('valueId'))
      .where('p.teamId', '=', team)
      .where('p.levelId', '=', levelId)
      .$asScalar(),
    eb.val(REPORT_STRUCTURE_NOT_SET)
  )
}

const selectDimensions = (
  expressions: ReportDimensionExpressions,
  dimensions: ReportQueryDimension[]
) => dimensions.map((dimension, idx) => dimensionExpression(expressions, dimension).as(`d${idx}`))

// The name most rows give a value, since a topic can be written more than one way. Labels come after the
// grouped columns, which are grouped by position
const selectDimensionLabels = (
  labels: ReportDimensionExpressions,
  dimensions: ReportQueryDimension[]
) =>
  dimensions.flatMap((dimension, idx) => {
    const label = isLevelDimension(dimension) ? null : labels[dimension]
    return label ? [eb.fn.agg<string>('mode', []).withinGroupOrderBy(label).as(`l${idx}`)] : []
  })

const requiredConditions = (
  conditions: ReportDimensionConditions,
  {dimensions, filters}: Pick<ReportMeasureQuery, 'dimensions' | 'filters'>
) =>
  [...new Set([...dimensions, ...filters.map(({dimension}) => dimension)])].flatMap((dimension) =>
    isLevelDimension(dimension) ? [] : (conditions[dimension] ?? [])
  )

const filterConditions = (
  expressions: ReportDimensionExpressions,
  filters: ReportMeasureFilter[]
) =>
  filters.map(({dimension, values}) => isAnyOf(dimensionExpression(expressions, dimension), values))

// the step index is column 1 and the dimensions follow it
const groupByStepAndDimensions = (dimensionCount: number) =>
  sql.raw(Array.from({length: dimensionCount + 1}, (_, idx) => idx + 1).join(', '))

const toMeasureResult = (
  rows: ReportQueryRow[],
  dimensions: ReportQueryDimension[]
): ReportMeasureResult => {
  const labels: ReportDimensionLabels = {}
  rows.forEach((row) => {
    dimensions.forEach((dimension, idx) => {
      const label = row[`l${idx}`]
      if (typeof label !== 'string' || !label) return
      const names = labels[dimension] ?? {}
      names[String(row[`d${idx}`])] ??= label
      labels[dimension] = names
    })
  })
  return {
    rows: rows.map((row) => ({
      stepIndex: row.stepIndex,
      keys: dimensions.map((_, idx) => String(row[`d${idx}`])),
      value: row.value
    })),
    estimatedCount: rows.reduce((sum, row) => sum + row.estimated, 0),
    labels,
    hiddenTeamIds: []
  }
}

export const groupReportRows = async <QueryDB, QueryTables extends keyof QueryDB>(
  query: ReportMeasureQuery,
  from: SelectQueryBuilder<QueryDB, QueryTables, {}>,
  source: ReportSource & {stepIndex: AliasableExpression<number>}
) => {
  const {dimensions, filters} = query
  const conditions = [
    ...source.where,
    ...requiredConditions(source.requires ?? {}, query),
    ...filterConditions(source.dimensions, filters)
  ]
  const reportQuery = conditions
    .reduce((builder, condition) => builder.where(condition), from)
    .select([
      source.stepIndex.as('stepIndex'),
      ...selectDimensions(source.dimensions, dimensions),
      source.value.as('value'),
      eb.cast<number>(source.estimated ?? eb.lit(0), 'integer').as('estimated'),
      ...selectDimensionLabels(source.labels ?? {}, dimensions)
    ])
    .groupBy(groupByStepAndDimensions(dimensions.length))
    .$castTo<ReportQueryRow>()
  return toMeasureResult(await executeReportQuery(reportQuery), dimensions)
}

export const countReportRows = <QueryDB, QueryTables extends keyof QueryDB>(
  query: ReportMeasureQuery,
  from: SelectQueryBuilder<QueryDB, QueryTables, {}>,
  source: ReportSource & {timestamp: Expression<Date>}
) => {
  const {stepStarts, stepEnds} = query
  const start = stepStarts[0]!
  const end = stepEnds[stepEnds.length - 1]!
  return groupReportRows(query, from, {
    ...source,
    stepIndex: eb.fn<number>('width_bucket', [
      source.timestamp,
      toTimestampArray([...stepStarts, end])
    ]),
    where: [...source.where, eb(source.timestamp, '>=', start), eb(source.timestamp, '<', end)]
  })
}

export const readingSteps = (readAt: Date[]) =>
  sql<ReadingStep>`unnest(${toTimestampArray(readAt)}) WITH ORDINALITY`.as<'Step'>(
    sql`${sql.id('Step')}(${sql.id('readAt')}, ${sql.id('index')})`
  )

export const readReportRows = <
  QueryDB extends {Step: ReadingStep},
  QueryTables extends keyof QueryDB
>(
  query: ReportMeasureQuery,
  from: SelectQueryBuilder<QueryDB, QueryTables, {}>,
  source: ReportSource & {isPresentAt: (at: Expression<Date>) => Expression<SqlBool>}
) =>
  groupReportRows(query, from, {
    ...source,
    stepIndex: readingStep.cast<number>('Step.index', 'integer'),
    where: [...source.where, source.isPresentAt(readingStep.ref('Step.readAt'))]
  })

// A person was on a team at a time if they had joined by then and hadn't been removed yet.
// Removing someone is the last write to their TeamMember row, so updatedAt is when they left
export const isTeamMemberAt = (
  member: {
    createdAt: Expression<Date>
    isNotRemoved: Expression<boolean>
    updatedAt: Expression<Date>
  },
  at: Expression<Date>
) =>
  eb.and([
    eb(member.createdAt, '<=', at),
    eb.or([member.isNotRemoved, eb(member.updatedAt, '>', at)])
  ])
