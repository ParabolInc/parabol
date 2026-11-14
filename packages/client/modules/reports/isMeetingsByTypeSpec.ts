import {isReportTimeDimension, type ReportSpec} from '../../shared/reports/reportCatalog'

// Bars of meetings over time by type, which show a sample before any team has held a meeting
const isMeetingsByTypeSpec = ({measures, breakdown, showAs}: ReportSpec) =>
  showAs === 'BARS' &&
  measures[0] === 'MEETINGS' &&
  breakdown.length === 2 &&
  isReportTimeDimension(breakdown[0]!.dimension) &&
  breakdown[1]!.dimension === 'MEETING_TYPE'

export default isMeetingsByTypeSpec
