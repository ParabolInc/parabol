import type {ReportSpec} from '../../../client/shared/reports/reportCatalog'
import toReportSpecShape from '../toReportSpecShape'

const spec: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'WEEK'}],
  filters: [
    {dimension: 'TEAM', values: ['team1', 'team2']},
    {dimension: 'MEETING_TYPE', values: ['teamPrompt']}
  ],
  where: [],
  period: {range: {startAt: '2026-09-01', endAt: '2026-09-30'}},
  compareTo: null,
  showAs: 'HEATMAP',
  sort: null,
  limit: null
}

test('the shape swaps team ids and dates for placeholders', () => {
  expect(toReportSpecShape(spec)).toBe(
    'MEETINGS | TEAM, WEEK | TEAM=<team>, MEETING_TYPE=teamPrompt |  | <dates> |  | HEATMAP |  | '
  )
})

test('a spec that follows the page has the page as its period', () => {
  expect(toReportSpecShape({...spec, period: null})).toContain('| <page> |')
})
