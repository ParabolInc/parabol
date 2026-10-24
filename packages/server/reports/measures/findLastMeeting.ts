import {sql} from 'kysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
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
import {templateOf} from './templateExpressions'

// The value is the start of the latest counted meeting in the period, in milliseconds since the epoch
const findLastMeeting = async (query: ReportMeasureQuery) => {
  const {teamIds, ownTeamIds, stepStarts, stepEnds, dimensions, filters} = query
  const template = templateOf('m', 'tpl', ownTeamIds)
  const dimensionExpressions: ReportDimensionExpressions = {
    TEAM: sql<string>`m."teamId"`,
    MEETING_TYPE: sql<string>`m."meetingType"::text`,
    TEMPLATE: template.key
  }
  const conditions = [
    sql<boolean>`m."teamId" = ANY(${teamIds}::text[])`,
    sql<boolean>`m."createdAt" >= ${stepStarts[0]}`,
    sql<boolean>`m."createdAt" < ${stepEnds[stepEnds.length - 1]}`,
    hasEnoughAttendees(sql.ref('m.id')),
    ...filterConditions(dimensionExpressions, filters)
  ]
  const rows = await executeReportQuery(sql<ReportQueryRow>`
    SELECT 1 AS "stepIndex",
      ${sql.join([
        ...selectDimensions(dimensionExpressions, dimensions),
        sql`(extract(epoch FROM max(m."createdAt")) * 1000)::float8 AS "value"`,
        sql`0 AS "estimated"`,
        ...selectDimensionLabels({TEMPLATE: template.label}, dimensions)
      ])}
    FROM "NewMeeting" AS m
    LEFT JOIN "MeetingTemplate" AS tpl ON tpl.id = m."templateId"
    WHERE ${sql.join(conditions, sql` AND `)}
    GROUP BY ${groupByStepAndDimensions(dimensions.length)}
  `)
  return toMeasureResult(rows, dimensions)
}

export default findLastMeeting
