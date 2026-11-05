import dayjs from 'dayjs'
import {
  REPORT_MEASURES,
  type ReportMeasure,
  reportMeasureUnitOf
} from '../../shared/reports/reportCatalog'
import type {ReportStepLength} from './reportSpecLabels'

const formatDecimal = (value: number) => value.toLocaleString(undefined, {maximumFractionDigits: 1})
// a Health score always shows its tenth, the way the meeting shows it
const formatScore = (value: number) =>
  value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})
const formatDollars = (value: number) =>
  value.toLocaleString(undefined, {style: 'currency', currency: 'USD', maximumFractionDigits: 0})

export const formatReportValue = (measure: ReportMeasure, value: number | null | undefined) => {
  const {kind} = REPORT_MEASURES[measure]
  if (kind === 'latest') return value == null ? 'Never' : dayjs(value).format('MMM D, YYYY')
  if (value == null) return '—'
  if (reportMeasureUnitOf(measure) === 'usd') return formatDollars(value)
  if (kind === 'share') return `${formatDecimal(value)}%`
  if (kind === 'score') return formatScore(value)
  return kind === 'median' ? formatDecimal(value) : value.toLocaleString()
}

export const formatReportChange = (measure: ReportMeasure, change: number) => {
  const {kind} = REPORT_MEASURES[measure]
  const size = Math.abs(change)
  if (reportMeasureUnitOf(measure) === 'usd') return formatDollars(size)
  if (kind === 'share') return `${formatDecimal(size)} ${size === 1 ? 'point' : 'points'}`
  if (kind === 'median') return `${formatDecimal(size)} ${size === 1 ? 'day' : 'days'}`
  return kind === 'score' ? formatScore(size) : size.toLocaleString()
}

// a time key's label is the local date its step starts on
export const formatReportStep = (
  localDate: string,
  step: ReportStepLength | null | undefined,
  isLong = false
) => {
  const date = dayjs(localDate)
  if (step === 'MONTH') return date.format(isLong ? 'MMMM YYYY' : 'MMM')
  if (step === 'WEEK' && isLong) return `Week of ${date.format('MMM D, YYYY')}`
  return date.format(isLong ? 'MMM D, YYYY' : 'MMM D')
}
