import {sql} from 'kysely'
import {hasEnoughMembers, isCountedMeetingInWindow} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {
  executeReportQuery,
  filterConditions,
  groupByStepAndDimensions,
  type ReportDimensionExpressions,
  type ReportQueryRow,
  selectDimensions,
  toMeasureResult
} from '../reportQueries'

const dimensionExpressions: ReportDimensionExpressions = {
  MEETING_TYPE: sql<string>`m."meetingType"::text`
}

// The same rule as activeTeamCount, applied to each step instead of the last 30 days
const countTeamsThatMet = async (query: ReportMeasureQuery) => {
  const {teamIds, stepStarts, stepEnds, dimensions, filters} = query
  const meeting = {
    id: sql.ref<string>('m.id'),
    createdAt: sql.ref<Date>('m.createdAt'),
    endedAt: sql.ref<Date | null>('m.endedAt')
  }
  const conditions = [
    hasEnoughMembers(sql.ref('m.teamId')),
    ...filterConditions(dimensionExpressions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT "Step"."index"::int AS "stepIndex",
      ${sql.join([
        ...selectDimensions(dimensionExpressions, dimensions),
        sql`count(DISTINCT m."teamId")::int AS "value"`,
        sql`0 AS "estimated"`
      ])}
    FROM unnest(${stepStarts}::timestamptz[], ${stepEnds}::timestamptz[])
      WITH ORDINALITY AS "Step"("start", "end", "index")
    JOIN "NewMeeting" AS m ON m."teamId" = ANY(${teamIds}::text[])
      AND ${isCountedMeetingInWindow(meeting, sql.ref('Step.start'), sql.ref('Step.end'))}
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions)
}

export default countTeamsThatMet
