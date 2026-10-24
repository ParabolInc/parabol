import type {ReportDimension, ReportSpec} from '../../client/shared/reports/reportCatalog'

const PLACEHOLDERS: Partial<Record<ReportDimension, string>> = {
  TEAM: '<team>',
  TEAM_LEVEL: '<level value>',
  PERSON: '<person>',
  TOPIC: '<topic>'
}

// The spec with team ids, team structure, people, topics and dates swapped for placeholders, so the same
// question from two orgs matches and no one's name or discussion is kept for analysis
const toReportSpecShape = (spec: ReportSpec) => {
  const {measures, breakdown, filters, where, period, compareTo, showAs, sort, limit} = spec
  return [
    measures.join(', '),
    breakdown.map(({dimension}) => dimension).join(', '),
    filters
      .map(({dimension, values}) => `${dimension}=${PLACEHOLDERS[dimension] ?? values.join('|')}`)
      .join(', '),
    where.map(({measure, operator, value}) => `${measure} ${operator} ${value}`).join(', '),
    period.preset ?? '<dates>',
    compareTo ?? '',
    showAs,
    sort ? `${sort.by} ${sort.order ?? ''}`.trim() : '',
    limit ?? ''
  ].join(' | ')
}

export default toReportSpecShape
