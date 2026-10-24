import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {isPokerImport, isTaskInTeams, taskDoneDate, taskSource} from './taskExpressions'

const DAY_SECONDS = 86400

// The median, so a few tasks cleared out of an old backlog don't swamp the rest
const medianDaysToDone = (query: ReportMeasureQuery) =>
  countReportRows(query, {
    ...taskSource(query),
    where: [
      isTaskInTeams(query.teamIds),
      sql<boolean>`t.status = 'done'`,
      sql<boolean>`NOT ${isPokerImport}`
    ],
    timestamp: taskDoneDate,
    value: sql<number>`round(percentile_cont(0.5) WITHIN GROUP (
      ORDER BY GREATEST(0, extract(epoch FROM ${taskDoneDate} - t."createdAt") / ${DAY_SECONDS})
    )::numeric, 1)::float8`,
    estimated: sql<number>`count(*) FILTER (WHERE t."doneAt" IS NULL)`
  })

export default medianDaysToDone
