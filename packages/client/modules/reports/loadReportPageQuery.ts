import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import type {QueryRefs} from '../../routing/queryRefs'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportPagePeriod} from './reportPeriodParam'
import toReportPanelVariables from './toReportPanelVariables'

// null means the results couldn't load, so the page offers to try again
const loadReportPageQuery = async (
  queryRefs: QueryRefs,
  orgId: string,
  spec: ReportSpec,
  period: ReportPagePeriod
) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const variables = {orgId, timeZone, ...toReportPanelVariables(spec, period)}
  try {
    return await queryRefs.load<ReportPageQuery>(reportPageQuery, variables)
  } catch {
    return null
  }
}

export default loadReportPageQuery
