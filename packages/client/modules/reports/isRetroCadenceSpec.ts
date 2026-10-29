import {isReportTimeDimension, type ReportSpec} from '../../shared/reports/reportCatalog'

// A heatmap of retrospectives over time, which shows a sample before any team has held one
const isRetroCadenceSpec = ({measures, breakdown, filters, showAs}: ReportSpec) => {
  const meetingTypes = filters.find(({dimension}) => dimension === 'MEETING_TYPE')?.values
  const columns = breakdown[breakdown.length - 1]
  return (
    showAs === 'HEATMAP' &&
    measures[0] === 'MEETINGS' &&
    meetingTypes?.length === 1 &&
    meetingTypes[0] === 'retrospective' &&
    !!columns &&
    isReportTimeDimension(columns.dimension)
  )
}

export default isRetroCadenceSpec
