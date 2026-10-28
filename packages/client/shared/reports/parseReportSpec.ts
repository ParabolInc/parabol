import {
  REPORT_CATEGORY_DIMENSIONS,
  REPORT_COMPARE_TO,
  REPORT_CONDITION_OPERATORS,
  REPORT_MEASURES,
  REPORT_PERIOD_PRESETS,
  REPORT_SORT_BY,
  REPORT_TIME_DIMENSIONS,
  REPORT_VIEWS,
  type ReportPeriod,
  type ReportSpec,
  SORT_DIRECTIONS
} from './reportCatalog'
import {validateReportSpec} from './validateReportSpec'

type Guard<T> = (value: unknown) => value is T

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isOneOf =
  <T extends string>(list: readonly T[]): Guard<T> =>
  (value): value is T =>
    typeof value === 'string' && (list as readonly string[]).includes(value)

const isKeyOf =
  <T extends object>(record: T): Guard<keyof T & string> =>
  (value): value is keyof T & string =>
    typeof value === 'string' && Object.hasOwn(record, value)

const isString = (value: unknown): value is string => typeof value === 'string'
const isMissing = (value: unknown): value is null | undefined =>
  value === null || value === undefined

const isMeasure = isKeyOf(REPORT_MEASURES)
const isView = isKeyOf(REPORT_VIEWS)
const isDimension = isOneOf([...REPORT_TIME_DIMENSIONS, ...REPORT_CATEGORY_DIMENSIONS])
const isOperator = isOneOf(REPORT_CONDITION_OPERATORS)
const isPreset = isOneOf(REPORT_PERIOD_PRESETS)
const isCompareTo = isOneOf(REPORT_COMPARE_TO)
const isSortBy = isOneOf(REPORT_SORT_BY)
const isSortDirection = isOneOf(SORT_DIRECTIONS)

// a missing list is empty; a list with one bad item is no list at all
const parseList = <T>(value: unknown, parseItem: (item: unknown) => T | null): T[] | null => {
  if (isMissing(value)) return []
  if (!Array.isArray(value)) return null
  const items = value.map(parseItem)
  return items.every((item): item is T => item !== null) ? items : null
}

// only an org structure level is named by a levelId, so one anywhere else is dropped
const levelIdOf = (item: Record<string, unknown>) =>
  item.dimension === 'TEAM_LEVEL' && isString(item.levelId) ? {levelId: item.levelId} : {}

const parseBreakdown = (item: unknown) =>
  isRecord(item) && isDimension(item.dimension)
    ? {dimension: item.dimension, ...levelIdOf(item)}
    : null

const parseFilter = (item: unknown) =>
  isRecord(item) &&
  isDimension(item.dimension) &&
  Array.isArray(item.values) &&
  item.values.every(isString)
    ? {dimension: item.dimension, ...levelIdOf(item), values: item.values}
    : null

const parseCondition = (item: unknown) =>
  isRecord(item) &&
  isMeasure(item.measure) &&
  isOperator(item.operator) &&
  typeof item.value === 'number'
    ? {measure: item.measure, operator: item.operator, value: item.value}
    : null

// the server gets a range's days as DateTimes, at midnight UTC
const toDay = (value: unknown) =>
  value instanceof Date ? value.toJSON().slice(0, 10) : isString(value) ? value : null

const parseRange = (value: unknown) => {
  if (!isRecord(value)) return null
  const startAt = toDay(value.startAt)
  const endAt = toDay(value.endAt)
  return startAt && endAt ? {startAt, endAt} : null
}

// a period is a preset or a range, never both
export const parseReportPeriod = (value: unknown): ReportPeriod | null => {
  if (!isRecord(value)) return null
  const {preset, range} = value
  if (isMissing(range)) return isPreset(preset) ? {preset} : null
  const parsedRange = parseRange(range)
  return parsedRange && isMissing(preset) ? {range: parsedRange} : null
}

const parseSort = (value: unknown) => {
  if (!isRecord(value) || !isSortBy(value.by)) return null
  const {order} = value
  if (!isMissing(order) && !isSortDirection(order)) return null
  return {by: value.by, order: order ?? null}
}

// Untrusted JSON, like a link's spec or a stored one, becomes a spec with only the fields Parabol knows,
// or null when it isn't shaped like one
const readReportSpec = (value: unknown): ReportSpec | null => {
  if (!isRecord(value)) return null
  const measures = parseList(value.measures, (item) => (isMeasure(item) ? item : null))
  const breakdown = parseList(value.breakdown, parseBreakdown)
  const filters = parseList(value.filters, parseFilter)
  const where = parseList(value.where, parseCondition)
  const period = isMissing(value.period) ? null : parseReportPeriod(value.period)
  const {compareTo, showAs, sort, limit} = value
  if (!measures || !breakdown || !filters || !where || !isView(showAs)) return null
  if (!isMissing(value.period) && !period) return null
  if (!isMissing(compareTo) && !isCompareTo(compareTo)) return null
  const parsedSort = isMissing(sort) ? null : parseSort(sort)
  if (!isMissing(sort) && !parsedSort) return null
  if (!isMissing(limit) && typeof limit !== 'number') return null
  return {
    measures,
    breakdown,
    filters,
    where,
    period,
    compareTo: compareTo ?? null,
    showAs,
    sort: parsedSort,
    limit: limit ?? null
  }
}

export type ParsedReportSpec = {spec: ReportSpec; problem: null} | {spec: null; problem: string}

// a spec Parabol can run, or what's wrong with the value
export const parseReportSpec = (value: unknown): ParsedReportSpec => {
  const spec = readReportSpec(value)
  if (!spec) return {spec: null, problem: 'That isn’t in the shape of a report spec'}
  const problem = validateReportSpec(spec)
  return problem === null ? {spec, problem} : {spec: null, problem}
}
