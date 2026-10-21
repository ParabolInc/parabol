import {sql} from 'kysely'
import {
  REPORT_NO_INTEGRATION,
  REPORT_NO_MEETING
} from '../../../client/shared/reports/reportCatalog'
import type {ReportDimensionExpressions} from '../reportQueries'

// t is the task, tm the meeting it was made in, dm the meeting that archived it as done
export const taskTables = sql`"Task" AS t
  LEFT JOIN "NewMeeting" AS tm ON tm.id = t."meetingId"
  LEFT JOIN "NewMeeting" AS dm ON dm.id = t."doneMeetingId"`

export const isTaskInTeams = (teamIds: string[]) =>
  sql<boolean>`t."teamId" = ANY(${teamIds}::text[])`

export const taskDimensions: ReportDimensionExpressions = {
  TEAM: sql<string>`t."teamId"`,
  MEETING_TYPE: sql<string>`COALESCE(tm."meetingType"::text, ${REPORT_NO_MEETING})`,
  TASK_STATUS: sql<string>`t.status::text`,
  DONE_OR_OPEN: sql<string>`CASE WHEN t.status = 'done' THEN 'done' ELSE 'open' END`,
  INTEGRATION: sql<string>`COALESCE(t.integration->>'service', ${REPORT_NO_INTEGRATION})`
}

// Sprint Poker pulls each story in as a task that's archived right away
export const isPokerImport = sql<boolean>`COALESCE(
  tm."meetingType" = 'poker' AND t."integrationHash" IS NOT NULL AND 'archived' = ANY(t.tags),
  false
)`

// doneAt only exists for tasks finished after it was added, so older ones fall back to the best date there is
export const taskDoneDate = sql<Date>`COALESCE(t."doneAt", dm."endedAt", t."updatedAt")`
