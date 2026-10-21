import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isPokerImport, isTaskInTeams, taskDimensions, taskTables} from './taskExpressions'

const countNewTasks = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    from: taskTables,
    where: [isTaskInTeams(query.teamIds), sql<boolean>`NOT ${isPokerImport}`],
    timestamp: sql.ref<Date>('t.createdAt'),
    dimensions: taskDimensions,
    value: sql<number>`count(*)::int`
  })

export default countNewTasks
