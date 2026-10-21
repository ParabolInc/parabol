import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {describeReportSpec, toReportSpecChips} from '../reportSpecLabels'

const spec = (overrides: Partial<ReportSpec>): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [],
  filters: [],
  where: [],
  period: {preset: 'PAGE'},
  showAs: 'NUMBER',
  ...overrides
})

const chipsOf = (reportSpec: ReportSpec, step: 'DAY' | 'WEEK' | 'MONTH' | null = null) =>
  toReportSpecChips(reportSpec, {step, teamNames: new Map([['team1', 'Core Infra']])}).map(
    ({name, value}) => `${name}: ${value}`
  )

test('each breakdown is named for its role in the view', () => {
  expect(
    chipsOf(
      spec({
        showAs: 'HEATMAP',
        breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
        filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
        sort: {by: 'VALUE', order: 'DESC'}
      })
    )
  ).toEqual([
    'Measure: Meetings',
    'Meeting type: Retrospective',
    'Rows: Team',
    'Columns: Month',
    'Sort: Largest first',
    'Show as: Heatmap'
  ])
  expect(
    chipsOf(spec({showAs: 'BARS', breakdown: [{dimension: 'TIME'}, {dimension: 'TEAM'}]}), 'WEEK')
  ).toEqual(['Measure: Meetings', 'Bars: Week', 'Stacks: Team', 'Show as: Bars'])
})

test('a report that keeps its own period says so, and dates sort by age', () => {
  expect(
    chipsOf(
      spec({
        measures: ['LAST_MEETING'],
        showAs: 'TABLE',
        breakdown: [{dimension: 'TEAM'}],
        where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 30}],
        period: {preset: 'ALL_TIME'},
        sort: {by: 'VALUE', order: 'ASC'}
      })
    )
  ).toEqual([
    'Measure: Last meeting',
    'Rows: Team',
    'Only show: Last meeting over 30 days ago, or never',
    'Period: All time',
    'Sort: Oldest first',
    'Show as: Table'
  ])
})

test('a team filter names the teams it knows', () => {
  expect(chipsOf(spec({filters: [{dimension: 'TEAM', values: ['team1']}]}))).toContain(
    'Team: Core Infra'
  )
  expect(chipsOf(spec({filters: [{dimension: 'TEAM', values: ['team1', 'team2']}]}))).toContain(
    'Team: 2 picked'
  )
})

test('a report without a name gets one from its spec', () => {
  expect(describeReportSpec(spec({}))).toBe('Meetings')
  expect(
    describeReportSpec(
      spec({showAs: 'HEATMAP', breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}]})
    )
  ).toBe('Meetings by team and month')
})
