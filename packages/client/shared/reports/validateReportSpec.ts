import {
  isReportAdditiveMeasure,
  isReportCountedOnceBy,
  isReportTimeDimension,
  MAX_REPORT_CONDITION_DAYS,
  MAX_REPORT_FILTER_VALUES,
  MAX_REPORT_LIMIT,
  REPORT_DONE_OR_OPEN,
  REPORT_MEASURES,
  REPORT_MEETING_TYPES,
  REPORT_NO_MEETING,
  REPORT_TASK_AGES,
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
  DONE_OR_OPEN: Object.keys(REPORT_DONE_OR_OPEN),
  TASK_AGE: Object.keys(REPORT_TASK_AGES)
}

const describeCount = ([min, max]: readonly [number, number], noun: string) =>
  `${min === max ? min : `${min} to ${max}`} ${max === 1 ? noun : `${noun}s`}`

// two levels of the org structure are different dimensions
export const toReportDimensionKey = ({
  dimension,
  levelId
}: {
  dimension: ReportDimension
  levelId?: string
}) => (levelId ? `${dimension}:${levelId}` : dimension)

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
  if (
    [...breakdown, ...filters].some(
      ({dimension, levelId}) => dimension === 'TEAM_LEVEL' && !levelId
    )
  ) {
    return 'TEAM_LEVEL needs the levelId of an org structure level'
  }
  if (new Set(breakdown.map(toReportDimensionKey)).size !== breakdown.length) {
    return 'A breakdown can only be used once'
  }
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
    // a team or org structure filter narrows which teams are counted, so every measure takes one
    const isTeamFilter = dimension === 'TEAM' || dimension === 'TEAM_LEVEL'
    const measure = !isTeamFilter && measures.find((m) => !isMeasureDimension(m, dimension))
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
  if (new Set(filters.map(toReportDimensionKey)).size !== filters.length) {
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

  const range = period?.range
  if (range) {
    if (!isRealDate(range.startAt) || !isRealDate(range.endAt)) {
      return 'A date range needs a start and end day as YYYY-MM-DD'
    }
    if (range.endAt < range.startAt) return 'A date range has to end after it starts'
  }

  const dateMeasure = measures.find((m) => REPORT_MEASURES[m].kind === 'latest')
  if (dateMeasure && compareTo) return `${dateMeasure} can't be compared`
  // a date has no height, so it can't be a line or a bar
  if (dateMeasure && (showAs === 'LINE' || showAs === 'BARS')) {
    return `${dateMeasure} can't be shown as ${showAs}`
  }
  // a stack adds up its parts, which a share or a median can't do
  const unstackable = measures.find((m) => !isReportAdditiveMeasure(m))
  if (unstackable && showAs === 'BARS' && dimensions.length === 2) {
    return `${unstackable} can't be stacked, so show it as LINE or HEATMAP`
  }
  // every stage of a flow has to add up to the same total
  if (showAs === 'FLOW') {
    const measure = measures[0]!
    if (REPORT_MEASURES[measure].kind !== 'count') return 'FLOW only shows counts'
    if (timeDimensions.length > 0) return "FLOW stages can't be time"
    const doubled = dimensions.find((dimension) => !isReportCountedOnceBy(measure, dimension))
    if (doubled)
      return `${measure} counts toward more than one ${doubled}, so it can't FLOW through it`
  }
  if (compareTo === 'PREVIOUS_CHECK') {
    if (measures.some((measure) => measure !== 'HEALTH_SCORE')) {
      return 'PREVIOUS_CHECK only compares HEALTH_SCORE'
    }
    if (timeDimensions.length > 0) return "PREVIOUS_CHECK can't be used over time"
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
