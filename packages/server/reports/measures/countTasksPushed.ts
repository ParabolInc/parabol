import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows} from '../reportQueries'
import {selectTasks, taskSource} from './taskExpressions'

// A push records no time, so a pushed task counts on the day it was made
const countTasksPushed = (query: ReportMeasureQuery) => {
  const {eb, isInTeams, breakdown} = taskSource(query)
  return countReportRows(query, selectTasks(), {
    ...breakdown,
    where: [isInTeams, eb('t.integrationHash', 'is not', null)],
    timestamp: eb.ref('t.createdAt'),
    value: eb.cast<number>(eb.fn.countAll(), 'integer')
  })
}

export default countTasksPushed
