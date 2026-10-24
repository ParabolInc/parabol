import type {ReportCompareTo} from '../../shared/reports/reportCatalog'

const COMPARISONS: Record<ReportCompareTo, string> = {
  PREVIOUS_PERIOD: 'vs. the period before',
  A_WEEK_EARLIER: 'vs. a week earlier',
  A_YEAR_EARLIER: 'vs. a year earlier',
  PREVIOUS_CHECK: 'vs. each team’s check before'
}

const formatComparison = (compareTo: ReportCompareTo) => COMPARISONS[compareTo]

export default formatComparison
