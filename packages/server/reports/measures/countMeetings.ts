import {sql} from 'kysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'

const countMeetings = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    from: sql`"NewMeeting" AS m`,
    where: [
      sql<boolean>`m."teamId" = ANY(${query.teamIds}::text[])`,
      hasEnoughAttendees(sql.ref('m.id'))
    ],
    timestamp: sql.ref<Date>('m.createdAt'),
    dimensions: {
      TEAM: sql<string>`m."teamId"`,
      MEETING_TYPE: sql<string>`m."meetingType"::text`
    },
    value: sql<number>`count(*)::int`
  })

export default countMeetings
