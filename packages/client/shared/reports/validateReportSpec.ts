import {
  isReportTimeDimension,
  MAX_REPORT_CONDITION_DAYS,
  MAX_REPORT_FILTER_VALUES,
  MAX_REPORT_LIMIT,
  REPORT_DONE_OR_OPEN,
  REPORT_MEASURES,
  REPORT_MEETING_TYPES,
  REPORT_NO_MEETING,
  REPORT_TASK_STATUSES,
  REPORT_VIEWS,
  type ReportDimension,
  type ReportMeasure,
  type ReportSpec
} from './reportCatalog'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_OPERATORS = ['OLDER_THAN_DAYS', 'WITHIN_DAYS']
const MAX_FILTER_VALUE_LENGTH = 100

const ENUMERATED_FILTER_VALUES: Partial<Record<ReportDimension, readonly string[]>> = {
  MEETING_TYPE: [...Object.keys(REPORT_MEETING_TYPES), REPORT_NO_MEETING],
  TASK_STATUS: Object.keys(REPORT_TASK_STATUSES),
  DONE_OR_OPEN: Object.keys(REPORT_DONE_OR_OPEN)
}

const describeCount = ([min, max]: readonly [number, number], noun: string) =>
  `${min === max ? min : `${min} to ${max}`} ${max === 1 ? noun : `${noun}s`}`

const isMeasureDimension = (measure: ReportMeasure, dimension: ReportDimension) =>
  (REPORT_MEASURES[measure].dimensions as readonly ReportDimension[]).includes(dimension)

const isRealDate = (date: string) => {
  if (!DATE_PATTERN.test(date)) return false
  const instant = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(instant.getTime()) && instant.toISOString().startsWith(date)
}

export const validateReportSpec = (spec: ReportSpec): string | null => {
  const {measures, breakdown, filters, where, period, compareTo, showAs, sort, limit} = spec
  const view = REPORT_VIEWS[showAs]
  const [minMeasures, maxMeasures] = view.measures
  if (measures.length < minMeasures || measures.length > maxMeasures) {
    return `${showAs} takes ${describeCount(view.measures, 'measure')}`
  }
  if (new Set(measures).size !== measures.length) return 'A measure can only be used once'

  const dimensions = breakdown.map(({dimension}) => dimension)
  const [minBreakdown, maxBreakdown] = view.breakdown
  if (dimensions.length < minBreakdown || dimensions.length > maxBreakdown) {
    return `${showAs} takes ${describeCount(view.breakdown, 'breakdown')}`
  }
  if (new Set(dimensions).size !== dimensions.length) return 'A breakdown can only be used once'
  const timeDimensions = dimensions.filter(isReportTimeDimension)
  if (timeDimensions.length > 1) return 'A report can only break down by time once'
  if ('firstIsTime' in view && view.firstIsTime) {
    const [firstDimension] = dimensions
    if (!firstDimension || !isReportTimeDimension(firstDimension)) {
      return `${showAs} must break down by time first`
    }
  }
  for (const dimension of dimensions) {
    const measure = measures.find((m) => !isMeasureDimension(m, dimension))
    if (measure) return `${measure} can't be broken down by ${dimension}`
  }

  for (const {dimension, values} of filters) {
    if (isReportTimeDimension(dimension)) return 'Use the period to filter by time'
    // a team filter narrows which teams are counted, so every measure takes one
    const measure = dimension !== 'TEAM' && measures.find((m) => !isMeasureDimension(m, dimension))
    if (measure) return `${measure} can't be filtered by ${dimension}`
    if (values.length === 0 || values.length > MAX_REPORT_FILTER_VALUES) {
      return `A filter takes 1 to ${MAX_REPORT_FILTER_VALUES} values`
    }
    if (values.some((value) => !value || value.length > MAX_FILTER_VALUE_LENGTH)) {
      return 'A filter value is empty or too long'
    }
    const allowedValues = ENUMERATED_FILTER_VALUES[dimension]
    const unknownValue = allowedValues && values.find((value) => !allowedValues.includes(value))
    if (unknownValue) return `${unknownValue} isn't a ${dimension} value`
  }
  if (new Set(filters.map(({dimension}) => dimension)).size !== filters.length) {
    return 'A dimension can only be filtered once'
  }

  for (const {measure, operator, value} of where) {
    if (!measures.includes(measure)) return `${measure} isn't in the report, so it can't be tested`
    const isDateMeasure = REPORT_MEASURES[measure].kind === 'latest'
    if (isDateMeasure !== DATE_OPERATORS.includes(operator)) {
      return `${operator} doesn't apply to ${measure}`
    }
    if (!Number.isFinite(value) || value < 0) return 'Only show needs a number of 0 or more'
    if (isDateMeasure && value > MAX_REPORT_CONDITION_DAYS) return 'Only show looks back too far'
  }

  const {preset, startDate, endDate} = period
  const hasRange = !!startDate || !!endDate
  if (!!preset === hasRange) return 'A period is either a preset or a start and end date'
  if (hasRange) {
    if (!startDate || !endDate || !isRealDate(startDate) || !isRealDate(endDate)) {
      return 'A custom period needs a start and end date as YYYY-MM-DD'
    }
    if (endDate < startDate) return 'A custom period has to end after it starts'
  }

  const dateMeasure = measures.find((m) => REPORT_MEASURES[m].kind === 'latest')
  if (dateMeasure && compareTo) return `${dateMeasure} can't be compared`
  // a date has no height, so it can't be a line or a bar
  if (dateMeasure && (showAs === 'LINE' || showAs === 'BARS')) {
    return `${dateMeasure} can't be shown as ${showAs}`
  }
  if (sort?.by === 'TIME' && timeDimensions.length === 0)
    return 'Sorting by time needs a time breakdown'
  if (sort?.by === 'NAME' && dimensions.every(isReportTimeDimension)) {
    return 'Sorting by name needs a breakdown other than time'
  }
  if (limit != null && (!Number.isInteger(limit) || limit < 1 || limit > MAX_REPORT_LIMIT)) {
    return `A limit is a whole number from 1 to ${MAX_REPORT_LIMIT}`
  }
  return null
}
