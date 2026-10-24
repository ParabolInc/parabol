import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {
  executeReportQuery,
  filterConditions,
  groupByStepAndDimensions,
  type ReportDimensionExpressions,
  type ReportQueryRow,
  selectDimensionLabels,
  selectDimensions,
  toMeasureResult
} from '../reportQueries'

const dimensionExpressions: ReportDimensionExpressions = {
  PERSON: sql<string>`u.id`,
  TEAM: sql<string>`mem."teamId"`
}

// When each member last used Parabol, in milliseconds since the epoch. Only the latest time is kept, so the
// period can't change it
const findLastSeen = async (query: ReportMeasureQuery) => {
  const {orgId, teamIds, isWholeOrg, dimensions, filters} = query
  const members = isWholeOrg
    ? {
        from: sql`"OrganizationUser" AS ou JOIN "User" AS u ON u.id = ou."userId"`,
        where: [sql<boolean>`ou."orgId" = ${orgId}`, sql<boolean>`ou."removedAt" IS NULL`]
      }
    : {
        from: sql`"TeamMember" AS mem JOIN "User" AS u ON u.id = mem."userId"`,
        where: [
          sql<boolean>`mem."teamId" = ANY(${teamIds}::text[])`,
          sql<boolean>`mem."isNotRemoved"`
        ]
      }
  const conditions = [...members.where, ...filterConditions(dimensionExpressions, filters)]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT 1 AS "stepIndex",
      ${sql.join([
        ...selectDimensions(dimensionExpressions, dimensions),
        sql`(extract(epoch FROM max(u."lastSeenAt")) * 1000)::float8 AS "value"`,
        sql`0 AS "estimated"`,
        ...selectDimensionLabels({PERSON: sql<string>`u."preferredName"`}, dimensions)
      ])}
    FROM ${members.from}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions)
}

export default findLastSeen
