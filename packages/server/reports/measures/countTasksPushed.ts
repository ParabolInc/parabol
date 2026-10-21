import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isTaskInTeams, taskDimensions, taskTables} from './taskExpressions'

// A push records no time, so a pushed task counts on the day it was made
const countTasksPushed = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    from: taskTables,
    where: [isTaskInTeams(query.teamIds), sql<boolean>`t."integrationHash" IS NOT NULL`],
    timestamp: sql.ref<Date>('t.createdAt'),
    dimensions: taskDimensions,
    value: sql<number>`count(*)::int`
  })

export default countTasksPushed
