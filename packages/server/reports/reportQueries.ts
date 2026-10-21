import {type RawBuilder, sql} from 'kysely'
import {
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED,
  type ReportCategoryDimension
} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import type {
  ReportDimensionLabels,
  ReportMeasureFilter,
  ReportMeasureQuery,
  ReportMeasureResult,
  ReportQueryDimension
} from './reportMeasureTypes'
import {isLevelDimension, toLevelRowId} from './teamStructure'

const STATEMENT_TIMEOUT_MS = 15000

export type ReportDimensionExpressions = Partial<
  Record<ReportCategoryDimension, RawBuilder<string>>
>

export type ReportDimensionConditions = Partial<
  Record<ReportCategoryDimension, RawBuilder<boolean>>
>

interface ReportSource {
  from: RawBuilder<unknown>
  where: RawBuilder<boolean>[]
  dimensions: ReportDimensionExpressions
  labels?: ReportDimensionExpressions
  // what a row needs to count when the report splits or filters by a dimension, like a topic to be named by
  requires?: ReportDimensionConditions
  value: RawBuilder<number>
  // how many of the counted rows rely on an estimated done date
  estimated?: RawBuilder<number>
}

export interface ReportQueryRow {
  stepIndex: number
  value: number | null
  estimated: number
  [dimensionKey: string]: unknown
}

export const executeReportQuery = async (query: RawBuilder<ReportQueryRow>) =>
  getKysely()
    .transaction()
    .execute(async (trx) => {
      await sql.raw(`SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`).execute(trx)
      const {rows} = await query.execute(trx)
      return rows
    })

// A team structure level splits by the value each row's team sits at
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
  const levelRowId = toLevelRowId(dimension)
  if (levelRowId === 0) return sql<string>`${REPORT_STRUCTURE_REMOVED}`
  return sql<string>`COALESCE(
    (SELECT p."valueId"::text FROM "TeamStructurePlacement" AS p
      WHERE p."teamId" = ${team} AND p."levelId" = ${levelRowId}),
    ${REPORT_STRUCTURE_NOT_SET}
  )`
}

export const selectDimensions = (
  expressions: ReportDimensionExpressions,
  dimensions: ReportQueryDimension[]
) =>
  dimensions.map(
    (dimension, idx) => sql`${dimensionExpression(expressions, dimension)} AS ${sql.ref(`d${idx}`)}`
  )

// The name most rows give a value, since a topic can be written more than one way. Labels come after the
// grouped columns, which are grouped by position
export const selectDimensionLabels = (
  labels: ReportDimensionExpressions,
  dimensions: ReportQueryDimension[]
) =>
  dimensions.flatMap((dimension, idx) => {
    const label = isLevelDimension(dimension) ? null : labels[dimension]
    return label ? [sql`mode() WITHIN GROUP (ORDER BY ${label}) AS ${sql.ref(`l${idx}`)}`] : []
  })

export const requiredConditions = (
  conditions: ReportDimensionConditions,
  {dimensions, filters}: Pick<ReportMeasureQuery, 'dimensions' | 'filters'>
) =>
  [...new Set([...dimensions, ...filters.map(({dimension}) => dimension)])].flatMap((dimension) =>
    isLevelDimension(dimension) ? [] : (conditions[dimension] ?? [])
  )

export const filterConditions = (
  expressions: ReportDimensionExpressions,
  filters: ReportMeasureFilter[]
) =>
  filters.map(
    ({dimension, values}) =>
      sql<boolean>`${dimensionExpression(expressions, dimension)} = ANY(${values}::text[])`
  )

// the step index is column 1 and the dimensions follow it
export const groupByStepAndDimensions = (dimensionCount: number) =>
  sql.raw(Array.from({length: dimensionCount + 1}, (_, idx) => idx + 1).join(', '))

export const toMeasureResult = (
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

export const countReportRows = async (
  query: ReportMeasureQuery,
  source: ReportSource & {timestamp: RawBuilder<Date>}
) => {
  const {stepStarts, stepEnds, dimensions, filters} = query
  const from = stepStarts[0]
  const to = stepEnds[stepEnds.length - 1]
  const thresholds = [...stepStarts, to]
  const conditions = [
    ...source.where,
    sql<boolean>`${source.timestamp} >= ${from}`,
    sql<boolean>`${source.timestamp} < ${to}`,
    ...requiredConditions(source.requires ?? {}, query),
    ...filterConditions(source.dimensions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT width_bucket(${source.timestamp}, ${thresholds}::timestamptz[]) AS "stepIndex",
      ${sql.join([
        ...selectDimensions(source.dimensions, dimensions),
        sql`${source.value} AS "value"`,
        sql`${source.estimated ?? sql`0`}::int AS "estimated"`,
        ...selectDimensionLabels(source.labels ?? {}, dimensions)
      ])}
    FROM ${source.from}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions)
}

export const readReportRows = async (
  query: ReportMeasureQuery,
  source: ReportSource & {isPresentAt: (at: RawBuilder<Date>) => RawBuilder<boolean>}
) => {
  const {readAt, dimensions, filters} = query
  const conditions = [
    ...source.where,
    source.isPresentAt(sql.ref<Date>('Step.readAt')),
    ...requiredConditions(source.requires ?? {}, query),
    ...filterConditions(source.dimensions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT "Step"."index"::int AS "stepIndex",
      ${sql.join([
        ...selectDimensions(source.dimensions, dimensions),
        sql`${source.value} AS "value"`,
        sql`${source.estimated ?? sql`0`}::int AS "estimated"`,
        ...selectDimensionLabels(source.labels ?? {}, dimensions)
      ])}
    FROM unnest(${readAt}::timestamptz[]) WITH ORDINALITY AS "Step"("readAt", "index")
    CROSS JOIN ${source.from}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions)
}

// A person was on a team at a time if they had joined by then and hadn't been removed yet.
// Removing someone is the last write to their TeamMember row, so updatedAt is when they left
export const isTeamMemberAt = (alias: string, at: RawBuilder<Date>) =>
  sql<boolean>`(
    ${sql.ref(`${alias}.createdAt`)} <= ${at}
    AND (${sql.ref(`${alias}.isNotRemoved`)} OR ${sql.ref(`${alias}.updatedAt`)} > ${at})
  )`
