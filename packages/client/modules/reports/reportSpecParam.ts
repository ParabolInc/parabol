import {parseReportSpec} from '../../shared/reports/parseReportSpec'
import {
  REPORT_CATEGORY_DIMENSIONS,
  REPORT_TIME_DIMENSIONS,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {formatReportPeriod, readReportPeriod} from './reportPeriodParam'

const LEVEL_ID_PREFIX = 'OrgStructureLevel:'
const LEVEL_PARAM_PREFIX = 'level-'
const REPORT_DIMENSIONS: readonly string[] = [
  ...REPORT_TIME_DIMENSIONS,
  ...REPORT_CATEGORY_DIMENSIONS
]

const toSlug = (key: string) => key.toLowerCase().replaceAll('_', '-')
const fromSlug = (slug: string) => slug.toUpperCase().replaceAll('-', '_')

const toDimensionParam = ({dimension, levelId}: {dimension: string; levelId?: string}) =>
  levelId ? `${LEVEL_PARAM_PREFIX}${levelId.replace(LEVEL_ID_PREFIX, '')}` : toSlug(dimension)

const fromDimensionParam = (param: string) =>
  param.startsWith(LEVEL_PARAM_PREFIX)
    ? {
        dimension: 'TEAM_LEVEL',
        levelId: `${LEVEL_ID_PREFIX}${param.slice(LEVEL_PARAM_PREFIX.length)}`
      }
    : {dimension: fromSlug(param)}

const isDimensionParam = (param: string) =>
  param.startsWith(LEVEL_PARAM_PREFIX) || REPORT_DIMENSIONS.includes(fromSlug(param))

// a comma inside a value is escaped, so values split back apart where they were joined
const joinList = (items: readonly string[]) =>
  items.map((item) => item.replaceAll('%', '%25').replaceAll(',', '%2C')).join(',')
const splitList = (text: string) => text.split(',').map(decodeURIComponent)

// Each part of the spec gets a readable param, and anything at its default is left out
export const writeReportSpecParams = (spec: ReportSpec): [string, string][] => {
  const {measures, breakdown, filters, where, period, compareTo, showAs, sort, limit} = spec
  const params: [string, string][] = [['measure', joinList(measures.map(toSlug))]]
  if (breakdown.length > 0) params.push(['by', breakdown.map(toDimensionParam).join(',')])
  filters.forEach((filter) => params.push([toDimensionParam(filter), joinList(filter.values)]))
  where.forEach(({measure, operator, value}) =>
    params.push(['where', `${toSlug(measure)}.${toSlug(operator)}.${value}`])
  )
  if (period) params.push(['range', formatReportPeriod(period)])
  if (compareTo) params.push(['compare', toSlug(compareTo)])
  if (sort)
    params.push(['sort', sort.order ? `${toSlug(sort.by)}-${toSlug(sort.order)}` : toSlug(sort.by)])
  if (limit) params.push(['limit', String(limit)])
  params.push(['view', toSlug(showAs)])
  return params
}

// null when the address doesn't hold a spec Parabol can run, like a link cut short
export const readReportSpecParams = (searchParams: URLSearchParams): ReportSpec | null => {
  const measure = searchParams.get('measure')
  const view = searchParams.get('view')
  if (!measure || !view) return null
  try {
    const by = searchParams.get('by')
    const rangeParam = searchParams.get('range')
    const period = rangeParam && readReportPeriod(rangeParam)
    if (rangeParam && !period) return null
    const sortMatch = searchParams.get('sort')?.match(/^(.+?)(?:-(asc|desc))?$/)
    const limit = searchParams.get('limit')
    return parseReportSpec({
      measures: splitList(measure).map(fromSlug),
      breakdown: by ? by.split(',').map(fromDimensionParam) : [],
      filters: [...searchParams]
        .filter(([key]) => isDimensionParam(key))
        .map(([key, values]) => ({...fromDimensionParam(key), values: splitList(values)})),
      where: searchParams.getAll('where').map((condition) => {
        const [measureSlug, operator, ...value] = condition.split('.')
        return {
          measure: fromSlug(measureSlug ?? ''),
          operator: fromSlug(operator ?? ''),
          value: Number(value.join('.'))
        }
      }),
      period: period || null,
      compareTo: searchParams.has('compare') ? fromSlug(searchParams.get('compare')!) : null,
      showAs: fromSlug(view),
      sort: sortMatch
        ? {by: fromSlug(sortMatch[1]!), order: sortMatch[2] ? fromSlug(sortMatch[2]) : null}
        : null,
      limit: limit ? Number(limit) : null
    }).spec
  } catch {
    return null
  }
}

export const parseReportSpecJSON = (json: string) => {
  try {
    return parseReportSpec(JSON.parse(json)).spec
  } catch {
    return null
  }
}
