import ms from 'ms'
import type {ReportSpec} from '../../../client/shared/reports/reportCatalog'
import type {ReportRow} from '../buildReportRows'
import {applyReportConditions, capReportSeries, limitReportRows} from '../shapeReportRows'

const spec = (overrides: Partial<ReportSpec>): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'WEEK'}, {dimension: 'TEAM'}],
  filters: [],
  where: [],
  period: {preset: 'LAST_3_MONTHS'},
  showAs: 'LINE',
  ...overrides
})

const row = (stepIndex: number, team: string, value: number | null): ReportRow => ({
  keys: [
    {value: `week${stepIndex}`, label: `Week ${stepIndex}`, isPartial: false},
    {value: team, label: team, isPartial: false}
  ],
  values: [value],
  previousValues: null,
  stepIndex
})

// team1 has the fewest meetings each week and team8 the most
const teams = Array.from({length: 8}, (_, idx) => `team${idx + 1}`)
const rows = [1, 2].flatMap((week) => teams.map((team, idx) => row(week, team, idx + week)))
const teamsIn = (shapedRows: ReportRow[]) => [
  ...new Set(shapedRows.map(({keys}) => keys[1]!.value))
]

test('a line chart keeps its 6 biggest lines', () => {
  expect(teamsIn(capReportSeries(rows, spec({})))).toEqual(teams.slice(2))
})

test('a table keeps every series', () => {
  expect(teamsIn(capReportSeries(rows, spec({showAs: 'TABLE'})))).toEqual(teams)
})

test('a limit ranks by value even when rows are sorted by time', () => {
  const limited = limitReportRows(rows, spec({showAs: 'TABLE', sort: {by: 'TIME'}, limit: 2}))
  expect(teamsIn(limited)).toEqual(['team7', 'team8'])
})

test('older than counts a date that never happened', () => {
  const now = new Date()
  const lastMeetings = [
    row(1, 'recent', now.getTime() - ms('2d')),
    row(1, 'stale', now.getTime() - ms('40d')),
    row(1, 'never', null)
  ]
  const olderThan30Days = spec({
    measures: ['LAST_MEETING'],
    showAs: 'TABLE',
    where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 30}]
  })
  expect(teamsIn(applyReportConditions(lastMeetings, olderThan30Days, now))).toEqual([
    'stale',
    'never'
  ])
})
