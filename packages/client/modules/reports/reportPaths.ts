import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {type ReportPagePeriod, toReportPeriodParam} from './reportPeriodParam'
import {readReportSpecParams, writeReportSpecParams} from './reportSpecParam'

// a report an address shows: on its own page, or on the Reports page as the answer to a question
export interface ReportAddress {
  spec: ReportSpec
  reportQuestionId: string | null
}

// commas and colons are left as they are, so lists and ids stay readable
const encodeQueryPart = (text: string) =>
  encodeURIComponent(text).replace(/%2C/g, ',').replace(/%3A/g, ':')

const toSearch = (
  spec: ReportSpec | null,
  reportQuestionId: string | null,
  period: ReportPagePeriod
) => {
  const params = spec ? writeReportSpecParams(spec) : []
  if (reportQuestionId) params.push(['question', reportQuestionId])
  const periodParam = toReportPeriodParam(period)
  if (periodParam) params.push(['period', periodParam])
  const search = params
    .map(([key, value]) => `${encodeQueryPart(key)}=${encodeQueryPart(value)}`)
    .join('&')
  return search ? `?${search}` : ''
}

export const readReportAddress = (searchParams: URLSearchParams): ReportAddress | null => {
  const spec = readReportSpecParams(searchParams)
  return spec ? {spec, reportQuestionId: searchParams.get('question')} : null
}

// the last part of a pin's id: its number, or the key of a built-in pin
export const toReportPinParam = (pinId: string) => pinId.slice(pinId.lastIndexOf(':') + 1)

export const toReportsHomePath = (
  orgId: string,
  period: ReportPagePeriod,
  answer: ReportAddress | null = null
) => `/reports/${orgId}${toSearch(answer?.spec ?? null, answer?.reportQuestionId ?? null, period)}`

export const toReportPagePath = (
  orgId: string,
  spec: ReportSpec,
  period: ReportPagePeriod,
  reportQuestionId: string | null = null
) => `/reports/${orgId}/report${toSearch(spec, reportQuestionId, period)}`

export const toReportPinPath = (orgId: string, pinId: string, period: ReportPagePeriod) =>
  `/reports/${orgId}/pins/${encodeURIComponent(toReportPinParam(pinId))}${toSearch(null, null, period)}`
