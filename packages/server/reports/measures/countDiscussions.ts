import {sql} from 'kysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {templateOf} from './templateExpressions'
import {joinTopic, topicOf} from './topicExpressions'

const topic = topicOf('rg', 'ai')

const countDiscussions = (query: ReportMeasureQuery, {withTask}: {withTask: boolean}) => {
  const template = templateOf('m', 'tpl', query.ownTeamIds)
  return countReportRows(query, {
    from: sql`"Discussion" AS d
      JOIN "NewMeeting" AS m ON m.id = d."meetingId"
      LEFT JOIN "MeetingTemplate" AS tpl ON tpl.id = m."templateId"
      ${joinTopic('d', 'rg', 'ai')}`,
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
      MEETING_TYPE: sql<string>`m."meetingType"::text`,
      TEMPLATE: template.key,
      TOPIC: topic.key
    },
    labels: {TEMPLATE: template.label, TOPIC: topic.label},
    requires: {TOPIC: topic.requires},
    value: sql<number>`count(*)::int`
  })
}

export default countDiscussions
