import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {selectTasks, taskSource} from './taskExpressions'

const DAY_SECONDS = 86400

// The median, so a few tasks cleared out of an old backlog don't swamp the rest
const medianDaysToDone = (query: ReportMeasureQuery) => {
  const {eb, isInTeams, isPokerImport, doneDate, breakdown} = taskSource(query)
  const daysToDone = eb.fn('greatest', [
    eb.lit(0),
    eb(
      sql<number>`extract(epoch FROM ${eb(doneDate, '-', eb.ref('t.createdAt'))})`,
      '/',
      DAY_SECONDS
    )
  ])
  const median = eb.fn.agg<number>('percentile_cont', [eb.lit(0.5)]).withinGroupOrderBy(daysToDone)
  return countReportRows(query, selectTasks(), {
    ...breakdown,
    where: [isInTeams, eb('t.status', '=', 'done'), eb.not(isPokerImport)],
    timestamp: doneDate,
    value: eb.cast<number>(eb.fn('round', [eb.cast(median, 'numeric'), eb.lit(1)]), 'float8'),
    estimated: eb.fn.countAll<number>().filterWhere('t.doneAt', 'is', null)
  })
}

export default medianDaysToDone
