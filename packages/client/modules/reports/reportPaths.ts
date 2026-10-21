import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {type ReportPagePeriod, toReportPeriodParam} from './reportPeriodParam'
import {decodeReportSpec, encodeReportSpec} from './reportSpecParam'

// a report an address shows: on its own page, or on the Reports page as the answer to a question
export interface ReportAddress {
  spec: ReportSpec
  title: string | null
  reportQuestionId: string | null
}

const toSearch = (report: ReportAddress | null, period: ReportPagePeriod) => {
  const params = new URLSearchParams()
  if (report) {
    params.set('spec', encodeReportSpec(report.spec))
    if (report.title) params.set('title', report.title)
    if (report.reportQuestionId) params.set('question', report.reportQuestionId)
  }
  const periodParam = toReportPeriodParam(period)
  if (periodParam) params.set('period', periodParam)
  const search = params.toString()
  return search ? `?${search}` : ''
}

export const readReportAddress = (searchParams: URLSearchParams): ReportAddress | null => {
  const spec = decodeReportSpec(searchParams.get('spec'))
  return spec
    ? {spec, title: searchParams.get('title'), reportQuestionId: searchParams.get('question')}
    : null
}

export const toReportsHomePath = (
  orgId: string,
  period: ReportPagePeriod,
  answer: ReportAddress | null = null
) => `/reports/${orgId}${toSearch(answer, period)}`

export const toReportPagePath = (
  orgId: string,
  spec: ReportSpec,
  title: string | null,
  period: ReportPagePeriod,
  reportQuestionId: string | null = null
) => `/reports/${orgId}/report${toSearch({spec, title, reportQuestionId}, period)}`
