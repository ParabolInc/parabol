import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import type {QueryRefs} from '../../routing/queryRefs'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportPagePeriod} from './reportPeriodParam'
import toReportPanelVariables from './toReportPanelVariables'

// A report's results come fresh on every visit. null means they couldn't load, so the page offers to try again
const loadReportPageQuery = async (
  queryRefs: QueryRefs,
  orgId: string,
  spec: ReportSpec,
  period: ReportPagePeriod
) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const variables = {orgId, timeZone, ...toReportPanelVariables(spec, period)}
  try {
    return await queryRefs.load<ReportPageQuery>(reportPageQuery, variables, {
      fetchPolicy: 'network-only'
    })
  } catch {
    return null
  }
}

export default loadReportPageQuery
