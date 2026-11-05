import {expressionBuilder, sql} from 'kysely'
import type {REPORT_TASK_AGES} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {readReportRows} from '../reportQueries'
import {selectTaskReadings, taskSource} from './taskExpressions'

type ReportTaskAge = keyof typeof REPORT_TASK_AGES

const readOpenTasks = (query: ReportMeasureQuery) => {
  const from = selectTaskReadings(query.readAt)
  const eb = expressionBuilder(from)
  const {isInTeams, doneDate, breakdown} = taskSource(query)
  // postgres subtracts timestamps to an interval, which kysely has no type for
  const age = eb(eb.ref('Step.readAt'), '-', eb.ref('t.createdAt')).$castTo<string>()
  const isYoungerThan = (limit: string) =>
    eb(age, '<', eb.cast<string>(eb.val(limit), sql`interval`))
  const taskAge = eb
    .case()
    .when(isYoungerThan('30 days'))
    .then<ReportTaskAge>('under30Days')
    .when(isYoungerThan('90 days'))
    .then<ReportTaskAge>('from30To90Days')
    .when(isYoungerThan('180 days'))
    .then<ReportTaskAge>('from90To180Days')
    .else<ReportTaskAge>('over180Days')
    .end()
  return readReportRows(query, from, {
    ...breakdown,
    dimensions: {...breakdown.dimensions, TASK_AGE: taskAge},
    where: [isInTeams, eb.not(eb(eb.val('archived'), '=', eb.fn.any('t.tags')))],
    isPresentAt: (at) =>
      eb.and([
        eb('t.createdAt', '<=', at),
        eb.not(eb.and([eb('t.status', '=', 'done'), eb(doneDate, '<=', at)]))
      ]),
    value: eb.cast<number>(eb.fn.countAll(), 'integer'),
    estimated: eb.fn
      .countAll<number>()
      .filterWhere(eb.and([eb('t.status', '=', 'done'), eb('t.doneAt', 'is', null)]))
  })
}

export default readOpenTasks
