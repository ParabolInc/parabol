import {sql} from 'kysely'
import {
  REPORT_NO_INTEGRATION,
  REPORT_NO_MEETING,
  REPORT_NO_PERSON
} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {templateOf} from './templateExpressions'
import {joinTopic, topicOf} from './topicExpressions'

// t is the task, tm the meeting it was made in, dm the meeting that archived it as done. The other joins
// name its template, owner and topic, and Postgres drops them when a report doesn't use them
const taskTables = sql`"Task" AS t
  LEFT JOIN "NewMeeting" AS tm ON tm.id = t."meetingId"
  LEFT JOIN "NewMeeting" AS dm ON dm.id = t."doneMeetingId"
  LEFT JOIN "MeetingTemplate" AS ttpl ON ttpl.id = tm."templateId"
  LEFT JOIN "User" AS tu ON tu.id = t."userId"
  LEFT JOIN "Discussion" AS td ON td.id = t."discussionId"
  ${joinTopic('td', 'trg', 'tai')}`

const taskTopic = topicOf('trg', 'tai')

export const taskSource = ({ownTeamIds}: ReportMeasureQuery) => {
  const template = templateOf('tm', 'ttpl', ownTeamIds)
  return {
    from: taskTables,
    dimensions: {
      TEAM: sql<string>`t."teamId"`,
      PERSON: sql<string>`COALESCE(t."userId", ${REPORT_NO_PERSON})`,
      MEETING_TYPE: sql<string>`COALESCE(tm."meetingType"::text, ${REPORT_NO_MEETING})`,
      TEMPLATE: template.key,
      TASK_STATUS: sql<string>`t.status::text`,
      DONE_OR_OPEN: sql<string>`CASE WHEN t.status = 'done' THEN 'done' ELSE 'open' END`,
      TOPIC: taskTopic.key,
      INTEGRATION: sql<string>`COALESCE(t.integration->>'service', ${REPORT_NO_INTEGRATION})`
    },
    labels: {
      PERSON: sql<string>`tu."preferredName"`,
      TEMPLATE: template.label,
      TOPIC: taskTopic.label
    },
    requires: {TOPIC: taskTopic.requires}
  }
}

export const isTaskInTeams = (teamIds: string[]) =>
  sql<boolean>`t."teamId" = ANY(${teamIds}::text[])`

// Sprint Poker pulls each story in as a task that's archived right away
export const isPokerImport = sql<boolean>`COALESCE(
  tm."meetingType" = 'poker' AND t."integrationHash" IS NOT NULL AND 'archived' = ANY(t.tags),
  false
)`

// doneAt only exists for tasks finished after it was added, so older ones fall back to the best date there is
export const taskDoneDate = sql<Date>`COALESCE(t."doneAt", dm."endedAt", t."updatedAt")`
