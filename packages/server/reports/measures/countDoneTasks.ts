import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {
  isPokerImport,
  isTaskInTeams,
  taskDimensions,
  taskDoneDate,
  taskTables
} from './taskExpressions'

const countDoneTasks = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    from: taskTables,
    where: [
      isTaskInTeams(query.teamIds),
      sql<boolean>`t.status = 'done'`,
      sql<boolean>`NOT ${isPokerImport}`
    ],
    timestamp: taskDoneDate,
    dimensions: taskDimensions,
    value: sql<number>`count(*)::int`,
    estimated: sql<number>`count(*) FILTER (WHERE t."doneAt" IS NULL)`
  })

export default countDoneTasks
