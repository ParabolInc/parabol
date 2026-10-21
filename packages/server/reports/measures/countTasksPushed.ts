import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isTaskInTeams, taskSource} from './taskExpressions'

// A push records no time, so a pushed task counts on the day it was made
const countTasksPushed = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    ...taskSource(query),
    where: [isTaskInTeams(query.teamIds), sql<boolean>`t."integrationHash" IS NOT NULL`],
    timestamp: sql.ref<Date>('t.createdAt'),
    value: sql<number>`count(*)::int`
  })

export default countTasksPushed
