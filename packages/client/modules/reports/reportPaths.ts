import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {type ReportPagePeriod, toReportPeriodParam} from './reportPeriodParam'
import {encodeReportSpec} from './reportSpecParam'

const withPeriod = (params: URLSearchParams, period: ReportPagePeriod) => {
  const periodParam = toReportPeriodParam(period)
  if (periodParam) params.set('period', periodParam)
  const search = params.toString()
  return search ? `?${search}` : ''
}

export const toReportsHomePath = (orgId: string, period: ReportPagePeriod) =>
  `/reports/${orgId}${withPeriod(new URLSearchParams(), period)}`

export const toReportPagePath = (
  orgId: string,
  spec: ReportSpec,
  title: string | null,
  period: ReportPagePeriod
) => {
  const params = new URLSearchParams({spec: encodeReportSpec(spec)})
  if (title) params.set('title', title)
  return `/reports/${orgId}/report${withPeriod(params, period)}`
}
