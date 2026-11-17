import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {isTeamHealthHeatmapSpec} from '../../shared/reports/teamHealthReportSpec'

// A Team Health heatmap also shows every team in the report together, for each category and over them all, with the
// same filters
const toAllTeamsReportSpecs = (spec: ReportSpec) => {
  if (!isTeamHealthHeatmapSpec(spec)) return null
  const byCategory: ReportSpec = {
    ...spec,
    breakdown: [{dimension: 'CATEGORY'}],
    where: [],
    compareTo: null,
    showAs: 'TABLE',
    sort: null,
    limit: null
  }
  return {byCategory, overall: {...byCategory, breakdown: []}}
}

export default toAllTeamsReportSpecs
