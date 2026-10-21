import type {ReportSpec} from '../../client/shared/reports/reportCatalog'

// The spec with team ids and dates swapped for placeholders, so the same question from two orgs matches
const toReportSpecShape = (spec: ReportSpec) => {
  const {measures, breakdown, filters, where, period, compareTo, showAs, sort, limit} = spec
  return [
    measures.join(', '),
    breakdown.map(({dimension}) => dimension).join(', '),
    filters
      .map(
        ({dimension, values}) =>
          `${dimension}=${dimension === 'TEAM' ? '<team>' : values.join('|')}`
      )
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
