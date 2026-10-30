import type {ReportDateRange, ReportPeriodPreset} from '../../shared/reports/reportCatalog'

export const REPORT_PAGE_PRESETS = [
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'LAST_3_MONTHS',
  'LAST_6_MONTHS',
  'LAST_12_MONTHS',
  'ALL_TIME'
] as const satisfies readonly ReportPeriodPreset[]
export type ReportPagePreset = (typeof REPORT_PAGE_PRESETS)[number]

const PRESET_PARAMS: Record<ReportPagePreset, string> = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_3_MONTHS: '3m',
  LAST_6_MONTHS: '6m',
  LAST_12_MONTHS: '12m',
  ALL_TIME: 'all'
}

export type ReportPagePeriod =
  | {preset: ReportPagePreset; range?: never}
  | {preset?: never; range: ReportDateRange}

export const DEFAULT_REPORT_PAGE_PERIOD: ReportPagePeriod = {preset: 'LAST_3_MONTHS'}

const RANGE_PARAM = /^(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})$/

// null when the param doesn't name a period, like a link that was cut short
export const readReportPeriod = (param: string | null): ReportPagePeriod | null => {
  const preset = REPORT_PAGE_PRESETS.find((key) => PRESET_PARAMS[key] === param)
  if (preset) return {preset}
  const range = param?.match(RANGE_PARAM)
  if (range && range[1]! <= range[2]!) return {range: {startAt: range[1]!, endAt: range[2]!}}
  return null
}

export const formatReportPeriod = (period: ReportPagePeriod) =>
  period.preset ? PRESET_PARAMS[period.preset] : `${period.range.startAt}_${period.range.endAt}`

export const parseReportPeriodParam = (param: string | null): ReportPagePeriod =>
  readReportPeriod(param) ?? DEFAULT_REPORT_PAGE_PERIOD

// null for the default, which keeps it out of the address
export const toReportPeriodParam = (period: ReportPagePeriod) =>
  period.preset === DEFAULT_REPORT_PAGE_PERIOD.preset ? null : formatReportPeriod(period)
