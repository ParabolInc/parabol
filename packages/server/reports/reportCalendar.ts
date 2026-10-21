import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type {
  ReportCompareTo,
  ReportPeriod,
  ReportPeriodPreset,
  ReportTimeDimension
} from '../../client/shared/reports/reportCatalog'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

export type ReportStepLength = 'DAY' | 'WEEK' | 'MONTH'

// Local dates are YYYY-MM-DD in the report's time zone. A range runs from startDate up to, not including, endDate
export interface ReportLocalRange {
  startDate: string
  endDate: string
  isWholeMonths: boolean
}

export interface ReportStep {
  start: Date
  end: Date
  // the local date the step would start on if the range didn't cut it short
  naturalStartDate: string
  isPartial: boolean
}

const MONTH_PRESETS: Partial<Record<ReportPeriodPreset, number>> = {
  LAST_3_MONTHS: 3,
  LAST_6_MONTHS: 6,
  LAST_12_MONTHS: 12
}
const DEFAULT_PAGE_PERIOD: ReportPeriod = {preset: 'LAST_3_MONTHS'}
const MAX_DAILY_STEPS = 31
const MAX_WEEKLY_DAYS = 186
const MAX_STEPS = 400

export const isTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', {timeZone})
    return true
  } catch {
    return false
  }
}

// calendar math runs in UTC so daylight saving never shifts a date; only the final instants use the time zone
const addDays = (localDate: string, days: number) =>
  dayjs.utc(localDate).add(days, 'day').format('YYYY-MM-DD')
const addMonths = (localDate: string, months: number) =>
  dayjs.utc(localDate).add(months, 'month').format('YYYY-MM-DD')
const startOfMonth = (localDate: string) => `${localDate.slice(0, 7)}-01`
const startOfWeek = (localDate: string) =>
  dayjs.utc(localDate).startOf('isoWeek').format('YYYY-MM-DD')
const daysBetween = (startDate: string, endDate: string) =>
  dayjs.utc(endDate).diff(dayjs.utc(startDate), 'day')
const monthsBetween = (startDate: string, endDate: string) =>
  dayjs.utc(endDate).diff(dayjs.utc(startDate), 'month')

export const toLocalDate = (instant: Date, timeZone: string) =>
  dayjs(instant).tz(timeZone).format('YYYY-MM-DD')
export const toInstant = (localDate: string, timeZone: string) =>
  dayjs.tz(localDate, timeZone).toDate()

interface ResolveOptions {
  timeZone: string
  now: Date
  orgCreatedAt: Date
}

export const resolveReportPeriod = (
  period: ReportPeriod,
  pagePeriod: ReportPeriod | null,
  {timeZone, now, orgCreatedAt}: ResolveOptions
): ReportLocalRange | string => {
  const effectivePeriod =
    period.preset === 'PAGE'
      ? pagePeriod && pagePeriod.preset !== 'PAGE'
        ? pagePeriod
        : DEFAULT_PAGE_PERIOD
      : period
  const today = toLocalDate(now, timeZone)
  const tomorrow = addDays(today, 1)
  const {preset, startDate, endDate} = effectivePeriod
  if (!preset) {
    if (!startDate || !endDate) return 'A custom period needs a start and end date'
    if (endDate > today) return 'A custom period can end today at the latest'
    if (endDate < startDate) return 'A custom period has to end after it starts'
    return {startDate, endDate: addDays(endDate, 1), isWholeMonths: false}
  }
  const months = MONTH_PRESETS[preset]
  if (months) {
    const thisMonth = startOfMonth(today)
    return {startDate: addMonths(thisMonth, -months), endDate: thisMonth, isWholeMonths: true}
  }
  if (preset === 'LAST_7_DAYS') {
    return {startDate: addDays(today, -6), endDate: tomorrow, isWholeMonths: false}
  }
  if (preset === 'LAST_30_DAYS') {
    return {startDate: addDays(today, -29), endDate: tomorrow, isWholeMonths: false}
  }
  if (preset === 'ALL_TIME') {
    const createdDate = toLocalDate(orgCreatedAt, timeZone)
    return {
      startDate: createdDate < today ? createdDate : today,
      endDate: tomorrow,
      isWholeMonths: false
    }
  }
  return `${preset} isn't a period`
}

export const chooseReportStepLength = (
  dimension: ReportTimeDimension,
  range: ReportLocalRange
): ReportStepLength => {
  if (dimension !== 'TIME') return dimension
  const days = daysBetween(range.startDate, range.endDate)
  if (days <= MAX_DAILY_STEPS) return 'DAY'
  if (days <= MAX_WEEKLY_DAYS) return 'WEEK'
  return 'MONTH'
}

const naturalStart = (localDate: string, stepLength: ReportStepLength) => {
  if (stepLength === 'WEEK') return startOfWeek(localDate)
  if (stepLength === 'MONTH') return startOfMonth(localDate)
  return localDate
}

const nextStart = (localDate: string, stepLength: ReportStepLength) => {
  if (stepLength === 'WEEK') return addDays(localDate, 7)
  if (stepLength === 'MONTH') return addMonths(localDate, 1)
  return addDays(localDate, 1)
}

export const buildReportSteps = (
  range: ReportLocalRange,
  stepLength: ReportStepLength | null,
  timeZone: string
): ReportStep[] | string => {
  const {startDate, endDate} = range
  if (!stepLength) {
    return [
      {
        start: toInstant(startDate, timeZone),
        end: toInstant(endDate, timeZone),
        naturalStartDate: startDate,
        isPartial: false
      }
    ]
  }
  const steps: ReportStep[] = []
  for (
    let cursor = naturalStart(startDate, stepLength);
    cursor < endDate;
    cursor = nextStart(cursor, stepLength)
  ) {
    if (steps.length === MAX_STEPS) return 'The period has too many steps. Pick a longer step'
    const next = nextStart(cursor, stepLength)
    const stepStart = cursor < startDate ? startDate : cursor
    const stepEnd = next > endDate ? endDate : next
    steps.push({
      start: toInstant(stepStart, timeZone),
      end: toInstant(stepEnd, timeZone),
      naturalStartDate: cursor,
      isPartial: stepStart !== cursor || stepEnd !== next
    })
  }
  return steps
}

export const shiftReportRange = (
  range: ReportLocalRange,
  compareTo: ReportCompareTo
): ReportLocalRange => {
  const {startDate, endDate, isWholeMonths} = range
  if (compareTo === 'A_WEEK_EARLIER') {
    return {startDate: addDays(startDate, -7), endDate: addDays(endDate, -7), isWholeMonths}
  }
  if (compareTo === 'A_YEAR_EARLIER') {
    return {startDate: addMonths(startDate, -12), endDate: addMonths(endDate, -12), isWholeMonths}
  }
  if (isWholeMonths) {
    const months = monthsBetween(startDate, endDate)
    return {startDate: addMonths(startDate, -months), endDate: startDate, isWholeMonths}
  }
  return {
    startDate: addDays(startDate, -daysBetween(startDate, endDate)),
    endDate: startDate,
    isWholeMonths
  }
}
