import {type RawBuilder, sql} from 'kysely'
import type {REPORT_TASK_AGES} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {readReportRows} from '../reportQueries'
import {isTaskInTeams, taskDoneDate, taskSource} from './taskExpressions'

type ReportTaskAge = keyof typeof REPORT_TASK_AGES

const YOUNGER_THAN: [ReportTaskAge, string][] = [
  ['under30Days', '30 days'],
  ['from30To90Days', '90 days'],
  ['from90To180Days', '180 days']
]
const OLDEST: ReportTaskAge = 'over180Days'

const taskAgeAt = (at: RawBuilder<Date>) =>
  sql<string>`CASE
    ${sql.join(
      YOUNGER_THAN.map(
        ([age, limit]) => sql`WHEN ${at} - t."createdAt" < ${limit}::interval THEN ${age}`
      ),
      sql` `
    )}
    ELSE ${OLDEST}
  END`

const readOpenTasks = (query: ReportMeasureQuery) => {
  const source = taskSource(query)
  return readReportRows(query, {
    ...source,
    dimensions: {...source.dimensions, TASK_AGE: taskAgeAt(sql.ref<Date>('Step.readAt'))},
    where: [isTaskInTeams(query.teamIds), sql<boolean>`NOT 'archived' = ANY(t.tags)`],
    isPresentAt: (at) =>
      sql<boolean>`t."createdAt" <= ${at} AND NOT (t.status = 'done' AND ${taskDoneDate} <= ${at})`,
    value: sql<number>`count(*)::int`,
    estimated: sql<number>`count(*) FILTER (WHERE t.status = 'done' AND t."doneAt" IS NULL)`
  })
}

export default readOpenTasks
