import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportPagePeriod} from './reportPeriodParam'

const withPagePeriod = (spec: ReportSpec, period: ReportPagePeriod): ReportSpec =>
  spec.period ? spec : {...spec, period}

export default withPagePeriod
