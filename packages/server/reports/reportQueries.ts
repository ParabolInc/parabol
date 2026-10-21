import {type RawBuilder, sql} from 'kysely'
import type {ReportCategoryDimension} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import type {
  ReportMeasureFilter,
  ReportMeasureQuery,
  ReportMeasureResult
} from './reportMeasureTypes'

const STATEMENT_TIMEOUT_MS = 15000

export type ReportDimensionExpressions = Partial<
  Record<ReportCategoryDimension, RawBuilder<string>>
>

interface ReportSource {
  from: RawBuilder<unknown>
  where: RawBuilder<boolean>[]
  dimensions: ReportDimensionExpressions
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

const dimensionExpression = (
  expressions: ReportDimensionExpressions,
  dimension: ReportCategoryDimension
) => {
  const expression = expressions[dimension]
  if (!expression) throw new Error(`This measure can't be split by ${dimension}`)
  return expression
}

export const selectDimensions = (
  expressions: ReportDimensionExpressions,
  dimensions: ReportCategoryDimension[]
) =>
  dimensions.map(
    (dimension, idx) => sql`${dimensionExpression(expressions, dimension)} AS ${sql.ref(`d${idx}`)}`
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
  dimensionCount: number
): ReportMeasureResult => ({
  rows: rows.map((row) => ({
    stepIndex: row.stepIndex,
    keys: Array.from({length: dimensionCount}, (_, idx) => String(row[`d${idx}`])),
    value: row.value
  })),
  estimatedCount: rows.reduce((sum, row) => sum + row.estimated, 0)
})

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
    ...filterConditions(source.dimensions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT width_bucket(${source.timestamp}, ${thresholds}::timestamptz[]) AS "stepIndex",
      ${sql.join([
        ...selectDimensions(source.dimensions, dimensions),
        sql`${source.value} AS "value"`,
        sql`${source.estimated ?? sql`0`}::int AS "estimated"`
      ])}
    FROM ${source.from}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions.length)
}

export const readReportRows = async (
  query: ReportMeasureQuery,
  source: ReportSource & {isPresentAt: (at: RawBuilder<Date>) => RawBuilder<boolean>}
) => {
  const {readAt, dimensions, filters} = query
  const conditions = [
    ...source.where,
    source.isPresentAt(sql.ref<Date>('Step.readAt')),
    ...filterConditions(source.dimensions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT "Step"."index"::int AS "stepIndex",
      ${sql.join([
        ...selectDimensions(source.dimensions, dimensions),
        sql`${source.value} AS "value"`,
        sql`${source.estimated ?? sql`0`}::int AS "estimated"`
      ])}
    FROM unnest(${readAt}::timestamptz[]) WITH ORDINALITY AS "Step"("readAt", "index")
    CROSS JOIN ${source.from}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions.length)
}

// A person was on a team at a time if they had joined by then and hadn't been removed yet.
// Removing someone is the last write to their TeamMember row, so updatedAt is when they left
export const isTeamMemberAt = (alias: string, at: RawBuilder<Date>) =>
  sql<boolean>`(
    ${sql.ref(`${alias}.createdAt`)} <= ${at}
    AND (${sql.ref(`${alias}.isNotRemoved`)} OR ${sql.ref(`${alias}.updatedAt`)} > ${at})
  )`
