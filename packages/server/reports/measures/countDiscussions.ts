import {sql} from 'kysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'

const countDiscussions = (query: ReportMeasureQuery, {withTask}: {withTask: boolean}) =>
  countReportRows(query, {
    from: sql`"Discussion" AS d JOIN "NewMeeting" AS m ON m.id = d."meetingId"`,
    where: [
      sql<boolean>`m."teamId" = ANY(${query.teamIds}::text[])`,
      hasEnoughAttendees(sql.ref('m.id')),
      withTask
        ? sql<boolean>`EXISTS (SELECT 1 FROM "Task" WHERE "Task"."discussionId" = d.id)`
        : sql<boolean>`true`
    ],
    timestamp: sql.ref<Date>('d.createdAt'),
    dimensions: {
      TEAM: sql<string>`m."teamId"`,
      MEETING_TYPE: sql<string>`m."meetingType"::text`
    },
    value: sql<number>`count(*)::int`
  })

export default countDiscussions
