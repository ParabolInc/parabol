import dayjs from 'dayjs'
import {REPORT_MEASURES, type ReportMeasure} from '../../shared/reports/reportCatalog'
import type {ReportStepLength} from './reportSpecLabels'

export const formatReportValue = (measure: ReportMeasure, value: number | null | undefined) => {
  if (REPORT_MEASURES[measure].kind === 'latest') {
    return value == null ? 'Never' : dayjs(value).format('MMM D, YYYY')
  }
  return value == null ? '—' : value.toLocaleString()
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
