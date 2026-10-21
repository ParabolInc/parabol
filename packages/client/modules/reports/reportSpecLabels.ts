import {
  isReportTimeDimension,
  REPORT_DIMENSION_LABELS,
  REPORT_MEASURES,
  REPORT_VALUE_LABELS,
  type ReportCompareTo,
  type ReportDimension,
  type ReportPeriodPreset,
  type ReportSpec,
  type ReportView
} from '../../shared/reports/reportCatalog'

export type ReportStepLength = 'DAY' | 'WEEK' | 'MONTH'

export const REPORT_PERIOD_LABELS: Record<ReportPeriodPreset, string> = {
  PAGE: 'The page’s period',
  LAST_7_DAYS: 'Last 7 days',
  LAST_30_DAYS: 'Last 30 days',
  LAST_3_MONTHS: 'Last 3 months',
  LAST_6_MONTHS: 'Last 6 months',
  LAST_12_MONTHS: 'Last 12 months',
  ALL_TIME: 'All time'
}

export const REPORT_COMPARE_LABELS: Record<ReportCompareTo, string> = {
  PREVIOUS_PERIOD: 'Previous period',
  A_WEEK_EARLIER: 'A week earlier',
  A_YEAR_EARLIER: 'A year earlier'
}

export const REPORT_VIEW_LABELS: Record<ReportView, string> = {
  NUMBER: 'Number',
  LINE: 'Line',
  BARS: 'Bars',
  HEATMAP: 'Heatmap',
  TABLE: 'Table'
}

const STEP_LABELS: Record<ReportStepLength, string> = {DAY: 'Day', WEEK: 'Week', MONTH: 'Month'}

// each view gives each breakdown position a role, and the chips name the role
const roleOf = (view: ReportView, position: number, count: number) => {
  if (view === 'LINE') return position === 0 ? 'Over' : 'Lines'
  if (view === 'BARS') return position === 0 ? 'Bars' : 'Stacks'
  if (view === 'HEATMAP' && position === count - 1) return 'Columns'
  return 'Rows'
}

export interface ReportSpecChip {
  name: string
  value: string
}

interface ChipOptions {
  // the step the server picked for Auto, once the report has run
  step: ReportStepLength | null | undefined
  // the names of the teams a report shows, which a team filter can name
  teamNames: Map<string, string>
}

export const formatReportDimension = (
  dimension: ReportDimension,
  step: ReportStepLength | null | undefined
) => {
  if (dimension !== 'TIME') return REPORT_DIMENSION_LABELS[dimension]
  return step ? STEP_LABELS[step] : 'Auto'
}

const describeCondition = ({measure, operator, value}: ReportSpec['where'][number]) => {
  const {label} = REPORT_MEASURES[measure]
  if (operator === 'OLDER_THAN_DAYS') return `${label} over ${value} days ago, or never`
  if (operator === 'WITHIN_DAYS') return `${label} in the last ${value} days`
  if (operator === 'AT_LEAST') return `${label} ${value} or more`
  if (operator === 'AT_MOST') return `${label} ${value} or fewer`
  return `${label} is ${value}`
}

const describeSort = (spec: ReportSpec) => {
  const {sort, measures} = spec
  if (!sort) return null
  const isAscending = sort.order === 'ASC' || (!sort.order && sort.by !== 'VALUE')
  if (sort.by === 'NAME') return isAscending ? 'A to Z' : 'Z to A'
  if (sort.by === 'TIME') return isAscending ? 'Oldest first' : 'Newest first'
  if (REPORT_MEASURES[measures[0]!].kind === 'latest') {
    return isAscending ? 'Oldest first' : 'Newest first'
  }
  return isAscending ? 'Smallest first' : 'Largest first'
}

export const toReportSpecChips = (spec: ReportSpec, {step, teamNames}: ChipOptions) => {
  const {measures, breakdown, filters, where, period, compareTo, showAs, limit} = spec
  const chips: ReportSpecChip[] = [
    {
      name: measures.length === 1 ? 'Measure' : 'Measures',
      value: measures.map((measure) => REPORT_MEASURES[measure].label).join(', ')
    }
  ]
  filters.forEach(({dimension, values}) => {
    const labels = values.map((value) =>
      dimension === 'TEAM'
        ? teamNames.get(value)
        : isReportTimeDimension(dimension)
          ? value
          : REPORT_VALUE_LABELS[dimension]?.[value]
    )
    const isEveryLabelKnown = labels.every((label) => label !== undefined)
    chips.push({
      name: REPORT_DIMENSION_LABELS[dimension],
      value: isEveryLabelKnown ? labels.join(', ') : `${values.length} picked`
    })
  })
  const roles = new Map<string, string[]>()
  breakdown.forEach(({dimension}, position) => {
    const role = roleOf(showAs, position, breakdown.length)
    roles.set(role, [...(roles.get(role) ?? []), formatReportDimension(dimension, step)])
  })
  roles.forEach((labels, role) => chips.push({name: role, value: labels.join(' › ')}))
  where.forEach((condition) => chips.push({name: 'Only show', value: describeCondition(condition)}))
  if (period.preset && period.preset !== 'PAGE') {
    chips.push({name: 'Period', value: REPORT_PERIOD_LABELS[period.preset]})
  } else if (period.startDate && period.endDate) {
    chips.push({name: 'Period', value: `${period.startDate} to ${period.endDate}`})
  }
  if (compareTo) chips.push({name: 'Compare to', value: REPORT_COMPARE_LABELS[compareTo]})
  const sortLabel = describeSort(spec)
  if (sortLabel) chips.push({name: 'Sort', value: sortLabel})
  if (limit) chips.push({name: 'Limit', value: String(limit)})
  chips.push({name: 'Show as', value: REPORT_VIEW_LABELS[showAs]})
  return chips
}

export const hasReportTimeBreakdown = (spec: ReportSpec) =>
  spec.breakdown.some(({dimension}) => isReportTimeDimension(dimension))

// A name for a report that arrives without one, like a link an agent made
export const describeReportSpec = (spec: ReportSpec) => {
  const measures = spec.measures.map((measure) => REPORT_MEASURES[measure].label).join(', ')
  const dimensions = spec.breakdown.map(({dimension}) =>
    REPORT_DIMENSION_LABELS[dimension].toLowerCase()
  )
  if (dimensions.length === 0) return measures
  const last = dimensions.pop()
  return `${measures} by ${dimensions.length > 0 ? `${dimensions.join(', ')} and ${last}` : last}`
}
