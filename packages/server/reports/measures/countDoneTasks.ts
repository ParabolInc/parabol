import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isPokerImport, isTaskInTeams, taskDoneDate, taskSource} from './taskExpressions'

const countDoneTasks = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    ...taskSource(query),
    where: [
      isTaskInTeams(query.teamIds),
      sql<boolean>`t.status = 'done'`,
      sql<boolean>`NOT ${isPokerImport}`
    ],
    timestamp: taskDoneDate,
    value: sql<number>`count(*)::int`,
    estimated: sql<number>`count(*) FILTER (WHERE t."doneAt" IS NULL)`
  })

export default countDoneTasks
