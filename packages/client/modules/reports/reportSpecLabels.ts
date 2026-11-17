import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_DIMENSION_LABELS,
  REPORT_MEASURES,
  REPORT_SPECIAL_VALUE_LABELS,
  REPORT_STRUCTURE_LABELS,
  REPORT_VALUE_LABELS,
  type ReportCompareTo,
  type ReportDimension,
  type ReportPeriodPreset,
  type ReportSpec,
  type ReportView
} from '../../shared/reports/reportCatalog'

export type ReportStepLength = 'DAY' | 'WEEK' | 'MONTH'

export const PAGE_PERIOD_LABEL = 'The page’s period'

export const REPORT_PERIOD_LABELS: Record<ReportPeriodPreset, string> = {
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
  FLOW: 'Flow',
  TABLE: 'Table'
}

const STEP_LABELS: Record<ReportStepLength, string> = {DAY: 'Day', WEEK: 'Week', MONTH: 'Month'}

// each view gives each breakdown position a role, and the chips name the role
const roleOf = (view: ReportView, position: number, count: number) => {
  if (view === 'LINE') return position === 0 ? 'Over' : 'Lines'
  if (view === 'BARS') return position === 0 ? 'Bars' : 'Stacks'
  if (view === 'FLOW') return `Stage ${position + 1}`
  if (view === 'HEATMAP' && position === count - 1) return 'Columns'
  return 'Rows'
}

export type ReportSpecChipEdit =
  | {kind: 'measure'}
  | {kind: 'filter'; index: number}
  | {kind: 'breakdown'; position: number}
  | {kind: 'where'; index: number}
  | {kind: 'period'}
  | {kind: 'compareTo'}
  | {kind: 'sort'}
  | {kind: 'limit'}
  | {kind: 'view'}

export interface ReportStructureLevel {
  id: string
  name: string
  values: readonly {id: string; name: string}[]
}

type ReportLevelName = Pick<ReportStructureLevel, 'id' | 'name'>

export interface ReportSpecChip {
  name: string
  value: string
  edit: ReportSpecChipEdit
}

interface ChipOptions {
  // the step the server picked for Auto, once the report has run
  step: ReportStepLength | null | undefined
  // the names of the teams a report shows, which a team filter can name
  teamNames: Map<string, string>
  levels: readonly ReportStructureLevel[]
}

const formatReportDimension = (
  dimension: ReportDimension,
  step: ReportStepLength | null | undefined
) => {
  if (dimension !== 'TIME') return REPORT_DIMENSION_LABELS[dimension]
  return step ? STEP_LABELS[step] : 'Auto'
}

const findLevel = <Level extends ReportLevelName>(
  levelId: string | undefined,
  levels: readonly Level[]
) => levels.find(({id}) => id === levelId)

const formatSpecDimension = (
  {dimension, levelId}: ReportSpec['breakdown'][number],
  step: ReportStepLength | null | undefined,
  levels: readonly ReportLevelName[]
) =>
  dimension === 'TEAM_LEVEL'
    ? (findLevel(levelId, levels)?.name ?? REPORT_STRUCTURE_LABELS.removed)
    : formatReportDimension(dimension, step)

// A result lists teams in place of a removed org structure level, so it names its own breakdown
export const formatReportBreakdown = (
  {dimension, levelName}: {dimension: ReportDimension; levelName: string | null | undefined},
  step: ReportStepLength | null | undefined
) =>
  dimension === 'TEAM_LEVEL'
    ? (levelName ?? REPORT_STRUCTURE_LABELS.removed)
    : formatReportDimension(dimension, step)

const formatFilterValue = (
  {dimension, levelId}: ReportSpec['filters'][number],
  value: string,
  {teamNames, levels}: ChipOptions
) => {
  if (dimension === 'TEAM') return teamNames.get(value)
  if (isReportTimeDimension(dimension)) return value
  const levelValue = findLevel(levelId, levels)?.values.find(({id}) => id === value)
  return (
    levelValue?.name ??
    REPORT_VALUE_LABELS[dimension]?.[value] ??
    REPORT_SPECIAL_VALUE_LABELS[dimension]?.[value]
  )
}

const describeCondition = ({measure, operator, value}: ReportSpec['where'][number]) => {
  const {label, kind} = REPORT_MEASURES[measure]
  if (operator === 'OLDER_THAN_DAYS') return `${label} over ${value} days ago, or never`
  if (operator === 'WITHIN_DAYS') return `${label} in the last ${value} days`
  const amount = kind === 'share' ? `${value}%` : value
  if (operator === 'AT_LEAST') return `${label} ${amount} or more`
  if (operator === 'AT_MOST') {
    return `${label} ${amount} or ${isReportAdditiveMeasure(measure) ? 'fewer' : 'less'}`
  }
  return `${label} is ${amount}`
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

export const toReportSpecChips = (spec: ReportSpec, options: ChipOptions) => {
  const {step, levels} = options
  const {measures, breakdown, filters, where, period, compareTo, showAs, limit} = spec
  const chips: ReportSpecChip[] = [
    {
      name: measures.length === 1 ? 'Measure' : 'Measures',
      value: measures.map((measure) => REPORT_MEASURES[measure].label).join(', '),
      edit: {kind: 'measure'}
    }
  ]
  filters.forEach((filter, index) => {
    const {values} = filter
    const labels = values.map((value) => formatFilterValue(filter, value, options))
    const isEveryLabelKnown = labels.every((label) => label !== undefined)
    chips.push({
      name: formatSpecDimension(filter, step, levels),
      value: isEveryLabelKnown ? labels.join(', ') : `${values.length} picked`,
      edit: {kind: 'filter', index}
    })
  })
  breakdown.forEach((item, position) => {
    chips.push({
      name: roleOf(showAs, position, breakdown.length),
      value: formatSpecDimension(item, step, levels),
      edit: {kind: 'breakdown', position}
    })
  })
  where.forEach((condition, index) => {
    chips.push({
      name: 'Only show',
      value: describeCondition(condition),
      edit: {kind: 'where', index}
    })
  })
  if (period?.preset) {
    chips.push({name: 'Period', value: REPORT_PERIOD_LABELS[period.preset], edit: {kind: 'period'}})
  } else if (period?.range) {
    chips.push({
      name: 'Period',
      value: `${period.range.startAt} to ${period.range.endAt}`,
      edit: {kind: 'period'}
    })
  }
  if (compareTo) {
    chips.push({
      name: 'Compare to',
      value: REPORT_COMPARE_LABELS[compareTo],
      edit: {kind: 'compareTo'}
    })
  }
  const sortLabel = describeSort(spec)
  if (sortLabel) chips.push({name: 'Sort', value: sortLabel, edit: {kind: 'sort'}})
  if (limit) chips.push({name: 'Limit', value: String(limit), edit: {kind: 'limit'}})
  chips.push({name: 'Show as', value: REPORT_VIEW_LABELS[showAs], edit: {kind: 'view'}})
  return chips
}

export const hasReportTimeBreakdown = (spec: ReportSpec) =>
  spec.breakdown.some(({dimension}) => isReportTimeDimension(dimension))

// A name for a report that arrives without one, like a link an agent made
export const describeReportSpec = (spec: ReportSpec, levels: readonly ReportLevelName[]) => {
  const measures = spec.measures.map((measure) => REPORT_MEASURES[measure].label).join(', ')
  // a level keeps the name its organization gave it
  const dimensions = spec.breakdown.map(({dimension, levelId}) =>
    dimension === 'TEAM_LEVEL'
      ? (findLevel(levelId, levels)?.name ?? REPORT_STRUCTURE_LABELS.removed.toLowerCase())
      : REPORT_DIMENSION_LABELS[dimension].toLowerCase()
  )
  if (dimensions.length === 0) return measures
  const last = dimensions.pop()
  return `${measures} by ${dimensions.length > 0 ? `${dimensions.join(', ')} and ${last}` : last}`
}
