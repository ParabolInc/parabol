import {
  isReportTimeDimension,
  REPORT_DONE_OR_OPEN,
  REPORT_MEASURES,
  REPORT_MEETING_TYPES,
  REPORT_TASK_STATUSES,
  REPORT_VALUE_LABELS,
  type ReportCategoryDimension,
  type ReportDimension,
  type ReportMeasure
} from '../../client/shared/reports/reportCatalog'
import type {ReportStep} from './reportCalendar'
import type {ReportMeasureFilter, ReportMeasureResult} from './reportMeasureTypes'

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
  DONE_OR_OPEN: Object.keys(REPORT_DONE_OR_OPEN)
}

const MAX_CANDIDATE_ROWS = 50000

interface Options {
  breakdown: ReportDimension[]
  measures: ReportMeasure[]
  steps: ReportStep[] | null
  previousStepCount: number
  teams: {id: string; name: string}[]
  filters: ReportMeasureFilter[]
  current: ReportMeasureResult[]
  previous: ReportMeasureResult[] | null
}

const rowKey = (stepIndex: number, keys: string[]) => JSON.stringify([stepIndex, ...keys])

const toValueMap = ({rows}: ReportMeasureResult) =>
  new Map(rows.map(({stepIndex, keys, value}) => [rowKey(stepIndex, keys), value]))

const emptyValue = (measure: ReportMeasure) =>
  REPORT_MEASURES[measure].kind === 'latest' ? null : 0

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
  previous
}: Options): ReportRow[] | string => {
  const categoryDimensions = breakdown.filter(
    (dimension): dimension is ReportCategoryDimension => !isReportTimeDimension(dimension)
  )
  const teamNames = new Map(teams.map(({id, name}) => [id, name]))
  const labelOf = (dimension: ReportCategoryDimension, value: string) =>
    (dimension === 'TEAM' ? teamNames.get(value) : REPORT_VALUE_LABELS[dimension]?.[value]) ?? value
  const results = [...current, ...(previous ?? [])]
  const valuesOf = categoryDimensions.map((dimension, position) => {
    const observed = results.flatMap(({rows}) => rows.map(({keys}) => keys[position] ?? ''))
    const values =
      dimension === 'TEAM'
        ? teams.map(({id}) => id)
        : [...new Set([...(STATIC_VALUES[dimension] ?? []), ...observed])]
    const filter = filters.find((f) => f.dimension === dimension)
    return filter ? values.filter((value) => filter.values.includes(value)) : values
  })
  const stepIndexes = steps ? steps.map((_, idx) => idx + 1) : [1]
  const categoryCombinations = combinations(valuesOf)
  if (stepIndexes.length * categoryCombinations.length > MAX_CANDIDATE_ROWS) {
    return 'This report would have too many rows. Add a filter or a limit'
  }
  const currentMaps = current.map(toValueMap)
  const previousMaps = previous?.map(toValueMap) ?? null
  return stepIndexes.flatMap((stepIndex) =>
    categoryCombinations.map((categoryValues) => {
      const key = rowKey(stepIndex, categoryValues)
      const keys = breakdown.map((dimension) => {
        if (isReportTimeDimension(dimension)) {
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
