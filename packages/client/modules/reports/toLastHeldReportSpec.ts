import {isReportTimeDimension, type ReportSpec} from '../../shared/reports/reportCatalog'
import {validateReportSpec} from '../../shared/reports/validateReportSpec'

// A heatmap of meetings by team over time also says when each team last met, with the same filters
const toLastHeldReportSpec = (spec: ReportSpec): ReportSpec | null => {
  const [rows, columns] = spec.breakdown
  if (spec.showAs !== 'HEATMAP' || spec.measures[0] !== 'MEETINGS' || spec.breakdown.length !== 2) {
    return null
  }
  if (rows?.dimension !== 'TEAM' || !columns || !isReportTimeDimension(columns.dimension))
    return null
  const lastHeldSpec: ReportSpec = {
    ...spec,
    measures: ['LAST_MEETING'],
    breakdown: [{dimension: 'TEAM'}],
    where: [],
    compareTo: null,
    showAs: 'TABLE',
    sort: null,
    limit: null
  }
  return validateReportSpec(lastHeldSpec) === null ? lastHeldSpec : null
}

export default toLastHeldReportSpec
