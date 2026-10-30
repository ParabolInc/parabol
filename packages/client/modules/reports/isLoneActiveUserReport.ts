import {isReportTimeDimension, type ReportSpec} from '../../shared/reports/reportCatalog'

// Active users over time that never counts more than 1 person, which shows a sample of a growing organization
// until there's someone to count besides the viewer
const isLoneActiveUserReport = (
  {measures, breakdown, showAs}: ReportSpec,
  rows: readonly {readonly values: readonly (number | null | undefined)[]}[]
) =>
  showAs === 'LINE' &&
  measures[0] === 'ACTIVE_USERS' &&
  breakdown.length === 1 &&
  isReportTimeDimension(breakdown[0]!.dimension) &&
  rows.every(({values}) => (values[0] ?? 0) <= 1)

export default isLoneActiveUserReport
