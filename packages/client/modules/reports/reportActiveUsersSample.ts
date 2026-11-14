import dayjs from 'dayjs'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportResultRow} from './reportRows'

// A made-up organization's active users over the last 3 months, week by week, shown faded behind the prompt to
// invite teammates: one person at first, then more every week as they bring their teams in
const ACTIVE_USERS_BY_WEEK = [1, 2, 3, 5, 8, 12, 17, 23, 30, 37, 43, 48, 52]

export const SAMPLE_ACTIVE_USERS_SPEC: ReportSpec = {
  measures: ['ACTIVE_USERS'],
  breakdown: [{dimension: 'TIME'}],
  filters: [],
  where: [],
  showAs: 'LINE'
}

export const SAMPLE_ACTIVE_USERS_ROWS: ReportResultRow[] = ACTIVE_USERS_BY_WEEK.map(
  (activeUsers, idx) => {
    const weeksAgo = ACTIVE_USERS_BY_WEEK.length - 1 - idx
    const start = dayjs().startOf('week').subtract(weeksAgo, 'week')
    return {
      keys: [
        {value: start.toISOString(), label: start.format('YYYY-MM-DD'), isPartial: weeksAgo === 0}
      ],
      values: [activeUsers],
      previousValues: null
    }
  }
)
