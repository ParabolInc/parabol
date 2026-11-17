import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {selectTasks, taskSource} from './taskExpressions'

const countNewTasks = (query: ReportMeasureQuery) => {
  const {eb, isInTeams, isPokerImport, breakdown} = taskSource(query)
  return countReportRows(query, selectTasks(), {
    ...breakdown,
    where: [isInTeams, eb.not(isPokerImport)],
    timestamp: eb.ref('t.createdAt'),
    value: eb.cast<number>(eb.fn.countAll(), 'integer')
  })
}

export default countNewTasks
