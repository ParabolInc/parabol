import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {selectTasks, taskSource} from './taskExpressions'

const countDoneTasks = (query: ReportMeasureQuery) => {
  const {eb, isInTeams, isPokerImport, doneDate, breakdown} = taskSource(query)
  return countReportRows(query, selectTasks(), {
    ...breakdown,
    where: [isInTeams, eb('t.status', '=', 'done'), eb.not(isPokerImport)],
    timestamp: doneDate,
    value: eb.cast<number>(eb.fn.countAll(), 'integer'),
    estimated: eb.fn.countAll<number>().filterWhere('t.doneAt', 'is', null)
  })
}

export default countDoneTasks
