import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isPokerImport, isTaskInTeams, taskSource} from './taskExpressions'

const countNewTasks = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    ...taskSource(query),
    where: [isTaskInTeams(query.teamIds), sql<boolean>`NOT ${isPokerImport}`],
    timestamp: sql.ref<Date>('t.createdAt'),
    value: sql<number>`count(*)::int`
  })

export default countNewTasks
