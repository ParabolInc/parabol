import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {readReportRows} from '../reportQueries'
import {isTaskInTeams, taskDimensions, taskDoneDate, taskTables} from './taskExpressions'

const readOpenTasks = (query: ReportMeasureQuery) =>
  readReportRows(query, {
    from: taskTables,
    where: [isTaskInTeams(query.teamIds), sql<boolean>`NOT 'archived' = ANY(t.tags)`],
    isPresentAt: (at) =>
      sql<boolean>`t."createdAt" <= ${at} AND NOT (t.status = 'done' AND ${taskDoneDate} <= ${at})`,
    dimensions: taskDimensions,
    value: sql<number>`count(*)::int`,
    estimated: sql<number>`count(*) FILTER (WHERE t.status = 'done' AND t."doneAt" IS NULL)`
  })

export default readOpenTasks
