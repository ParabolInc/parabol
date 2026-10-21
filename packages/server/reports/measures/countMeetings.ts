import {sql} from 'kysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {templateOf} from './templateExpressions'

// By person, a meeting counts once for each person who joined it
const countMeetings = (query: ReportMeasureQuery) => {
  const template = templateOf('m', 'tpl', query.ownTeamIds)
  const isByPerson = [
    ...query.dimensions,
    ...query.filters.map(({dimension}) => dimension)
  ].includes('PERSON')
  const meetings = sql`"NewMeeting" AS m LEFT JOIN "MeetingTemplate" AS tpl ON tpl.id = m."templateId"`
  return countReportRows(query, {
    from: isByPerson
      ? sql`${meetings}
        JOIN "MeetingMember" AS mm ON mm."meetingId" = m.id
        JOIN "User" AS mu ON mu.id = mm."userId"`
      : meetings,
    where: [
      sql<boolean>`m."teamId" = ANY(${query.teamIds}::text[])`,
      hasEnoughAttendees(sql.ref('m.id'))
    ],
    timestamp: sql.ref<Date>('m.createdAt'),
    dimensions: {
      TEAM: sql<string>`m."teamId"`,
      PERSON: sql<string>`mm."userId"`,
      MEETING_TYPE: sql<string>`m."meetingType"::text`,
      TEMPLATE: template.key
    },
    labels: {PERSON: sql<string>`mu."preferredName"`, TEMPLATE: template.label},
    value: sql<number>`count(DISTINCT m.id)::int`
  })
}

export default countMeetings
