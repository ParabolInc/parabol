import {
  isReportAdditiveMeasure,
  isReportTimeDimension,
  REPORT_DONE_OR_OPEN,
  REPORT_MEETING_TYPES,
  REPORT_SPECIAL_VALUE_LABELS,
  REPORT_TASK_AGES,
  REPORT_TASK_STATUSES,
  REPORT_VALUE_LABELS,
  type ReportCategoryDimension,
  type ReportDimension,
  type ReportMeasure,
  type ReportTimeDimension
} from '../../client/shared/reports/reportCatalog'
import type {ReportStep} from './reportCalendar'
import type {
  ReportMeasureFilter,
  ReportMeasureResult,
  ReportQueryDimension
} from './reportMeasureTypes'
import {isLevelDimension, type ReportLevelDimension} from './teamStructure'

export interface ReportRowKey {
  value: string
  label: string
  isPartial: boolean
}

export interface ReportRow {
  keys: ReportRowKey[]
  values: (number | null)[]
  previousValues: (number | null)[] | null
  stepIndex: number
}

// Every value a dimension can take, so a combination with nothing in it still gets a row
const STATIC_VALUES: Partial<Record<ReportCategoryDimension, string[]>> = {
  MEETING_TYPE: Object.keys(REPORT_MEETING_TYPES),
  TASK_STATUS: Object.keys(REPORT_TASK_STATUSES),
  DONE_OR_OPEN: Object.keys(REPORT_DONE_OR_OPEN),
  TASK_AGE: Object.keys(REPORT_TASK_AGES)
}

const MAX_CANDIDATE_ROWS = 50000

interface Options {
  breakdown: (ReportDimension | ReportLevelDimension)[]
  measures: ReportMeasure[]
  steps: ReportStep[] | null
  previousStepCount: number
  teams: {id: string; name: string}[]
  filters: ReportMeasureFilter[]
  current: ReportMeasureResult[]
  previous: ReportMeasureResult[] | null
  // the values a team structure level takes among the counted teams, with their names
  levelValuesOf: (dimension: ReportLevelDimension) => {value: string; label: string}[]
  teamValueOf: (dimension: ReportLevelDimension, teamId: string) => string
}

const isTimeDimension = (
  dimension: ReportDimension | ReportLevelDimension
): dimension is ReportTimeDimension =>
  !isLevelDimension(dimension) && isReportTimeDimension(dimension)

const rowKey = (stepIndex: number, keys: string[]) => JSON.stringify([stepIndex, ...keys])

const toValueMap = ({rows}: ReportMeasureResult) =>
  new Map(rows.map(({stepIndex, keys, value}) => [rowKey(stepIndex, keys), value]))

// nothing to count is 0, but a date, share or median of nothing has no value at all
const emptyValue = (measure: ReportMeasure) => (isReportAdditiveMeasure(measure) ? 0 : null)

const combinations = (lists: string[][]) =>
  lists.reduce<string[][]>(
    (prefixes, list) => prefixes.flatMap((prefix) => list.map((value) => [...prefix, value])),
    [[]]
  )

const buildReportRows = ({
  breakdown,
  measures,
  steps,
  previousStepCount,
  teams,
  filters,
  current,
  previous,
  levelValuesOf,
  teamValueOf
}: Options): ReportRow[] | string => {
  const categoryDimensions = breakdown.filter(
    (dimension): dimension is ReportQueryDimension => !isTimeDimension(dimension)
  )
  const teamNames = new Map(teams.map(({id, name}) => [id, name]))
  const results = [...current, ...(previous ?? [])]
  const labelOf = (dimension: ReportQueryDimension, value: string) => {
    if (isLevelDimension(dimension)) {
      return levelValuesOf(dimension).find((level) => level.value === value)?.label ?? value
    }
    return (
      (dimension === 'TEAM'
        ? teamNames.get(value)
        : (REPORT_VALUE_LABELS[dimension]?.[value] ??
          REPORT_SPECIAL_VALUE_LABELS[dimension]?.[value] ??
          results.find(({labels}) => labels[dimension]?.[value])?.labels[dimension]?.[value])) ??
      value
    )
  }
  const valuesOf = categoryDimensions.map((dimension, position) => {
    const observed = results.flatMap(({rows}) => rows.map(({keys}) => keys[position] ?? ''))
    const values = isLevelDimension(dimension)
      ? levelValuesOf(dimension).map(({value}) => value)
      : dimension === 'TEAM'
        ? teams.map(({id}) => id)
        : [...new Set([...(STATIC_VALUES[dimension] ?? []), ...observed])]
    const filter = filters.find((f) => f.dimension === dimension)
    return filter ? values.filter((value) => filter.values.includes(value)) : values
  })
  const stepIndexes = steps ? steps.map((_, idx) => idx + 1) : [1]
  // A team sits at one value of each team structure level, so when a report splits by teams and levels, or by two
  // levels, only the combinations some counted team holds are rows
  const teamPositions = categoryDimensions.flatMap((dimension, position) =>
    dimension === 'TEAM' || isLevelDimension(dimension) ? [position] : []
  )
  const toTeamKey = (valueAt: (dimension: ReportQueryDimension, position: number) => string) =>
    JSON.stringify(
      teamPositions.map((position) => valueAt(categoryDimensions[position]!, position))
    )
  const heldTeamKeys = new Set(
    teams.map(({id}) =>
      toTeamKey((dimension) => (isLevelDimension(dimension) ? teamValueOf(dimension, id) : id))
    )
  )
  const categoryCombinations = combinations(valuesOf).filter(
    (values) =>
      teamPositions.length < 2 || heldTeamKeys.has(toTeamKey((_, position) => values[position]!))
  )
  if (stepIndexes.length * categoryCombinations.length > MAX_CANDIDATE_ROWS) {
    return 'This report would have too many rows. Add a filter or a limit'
  }
  const currentMaps = current.map(toValueMap)
  const previousMaps = previous?.map(toValueMap) ?? null
  return stepIndexes.flatMap((stepIndex) =>
    categoryCombinations.map((categoryValues) => {
      const key = rowKey(stepIndex, categoryValues)
      const keys = breakdown.map((dimension) => {
        if (isTimeDimension(dimension)) {
          const step = steps?.[stepIndex - 1]
          return {
            value: step?.start.toISOString() ?? '',
            label: step?.naturalStartDate ?? '',
            isPartial: step?.isPartial ?? false
          }
        }
        const value = categoryValues[categoryDimensions.indexOf(dimension)] ?? ''
        return {value, label: labelOf(dimension, value), isPartial: false}
      })
      const previousValues =
        previousMaps &&
        measures.map((measure, idx) =>
          stepIndex > previousStepCount
            ? null
            : (previousMaps[idx]?.get(key) ?? emptyValue(measure))
        )
      return {
        keys,
        values: measures.map((measure, idx) => currentMaps[idx]?.get(key) ?? emptyValue(measure)),
        previousValues,
        stepIndex
      }
    })
  )
}

export default buildReportRows
