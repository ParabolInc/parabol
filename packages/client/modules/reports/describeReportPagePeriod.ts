import dayjs from 'dayjs'
import type {ReportPagePeriod, ReportPagePreset} from './reportPeriodParam'
import {REPORT_PERIOD_LABELS} from './reportSpecLabels'

const MONTHS: Partial<Record<ReportPagePreset, number>> = {
  LAST_3_MONTHS: 3,
  LAST_6_MONTHS: 6,
  LAST_12_MONTHS: 12
}

const formatRange = (start: dayjs.Dayjs, end: dayjs.Dayjs, unit: 'day' | 'month') => {
  const endFormat = unit === 'day' ? 'MMM D, YYYY' : 'MMM YYYY'
  const startFormat = start.year() !== end.year() ? endFormat : unit === 'day' ? 'MMM D' : 'MMM'
  return `${start.format(startFormat)} – ${end.format(endFormat)}`
}

// The dates a preset covers today. Day presets end today; month presets end with last month
export const describeReportPreset = (preset: ReportPagePreset, orgCreatedAt: string) => {
  if (preset === 'ALL_TIME') return `Since ${dayjs(orgCreatedAt).format('MMM YYYY')}`
  const today = dayjs().startOf('day')
  const months = MONTHS[preset]
  if (months) {
    const thisMonth = today.startOf('month')
    return formatRange(thisMonth.subtract(months, 'month'), thisMonth.subtract(1, 'month'), 'month')
  }
  return formatRange(today.subtract(preset === 'LAST_7_DAYS' ? 6 : 29, 'day'), today, 'day')
}

export const describeCustomRange = (period: ReportPagePeriod) =>
  period.startDate && period.endDate
    ? formatRange(dayjs(period.startDate), dayjs(period.endDate), 'day')
    : null

export const describeReportPagePeriod = (period: ReportPagePeriod) =>
  period.preset ? REPORT_PERIOD_LABELS[period.preset] : describeCustomRange(period)
