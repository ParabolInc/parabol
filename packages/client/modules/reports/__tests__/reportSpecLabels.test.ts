import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {
  describeReportSpec,
  formatReportBreakdown,
  type ReportStructureLevel,
  toReportSpecChips
} from '../reportSpecLabels'

const spec = (overrides: Partial<ReportSpec>): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [],
  filters: [],
  where: [],
  period: {preset: 'PAGE'},
  showAs: 'NUMBER',
  ...overrides
})

const LEVELS: ReportStructureLevel[] = [
  {id: 'level1', name: 'Business unit', values: [{id: 'value1', name: 'Platform'}]}
]

const chipsOf = (reportSpec: ReportSpec, step: 'DAY' | 'WEEK' | 'MONTH' | null = null) =>
  toReportSpecChips(reportSpec, {
    step,
    teamNames: new Map([['team1', 'Core Infra']]),
    levels: LEVELS
  }).map(({name, value}) => `${name}: ${value}`)

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

test('a share is tested in percent, and a median or share is less rather than fewer', () => {
  expect(
    chipsOf(
      spec({
        measures: ['ACTIVE_SHARE'],
        showAs: 'TABLE',
        breakdown: [{dimension: 'TEAM'}],
        where: [{measure: 'ACTIVE_SHARE', operator: 'AT_MOST', value: 50}]
      })
    )
  ).toContain('Only show: Active share 50% or less')
})

test('a flow names its breakdowns as stages', () => {
  expect(
    chipsOf(
      spec({
        measures: ['NEW_TASKS'],
        showAs: 'FLOW',
        breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}]
      })
    )
  ).toEqual([
    'Measure: New tasks',
    'Stage 1: Meeting type',
    'Stage 2: Task status',
    'Show as: Flow'
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
  expect(describeReportSpec(spec({}), [])).toBe('Meetings')
  expect(
    describeReportSpec(
      spec({showAs: 'HEATMAP', breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}]}),
      []
    )
  ).toBe('Meetings by team and month')
  expect(
    describeReportSpec(
      spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM_LEVEL', levelId: 'level1'}]}),
      LEVELS
    )
  ).toBe('Meetings by Business unit')
  expect(
    describeReportSpec(
      spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM_LEVEL', levelId: 'level9'}]}),
      LEVELS
    )
  ).toBe('Meetings by removed level')
})

test('an org structure level goes by its own name, or as removed once it is gone', () => {
  const byLevel = (levelId: string) =>
    chipsOf(
      spec({
        showAs: 'BARS',
        breakdown: [{dimension: 'TEAM_LEVEL', levelId}],
        filters: [{dimension: 'TEAM_LEVEL', levelId, values: ['value1', 'notSet']}]
      })
    )
  expect(byLevel('level1')).toEqual(
    expect.arrayContaining(['Business unit: Platform, Not set', 'Bars: Business unit'])
  )
  expect(byLevel('level9')).toEqual(
    expect.arrayContaining(['Removed level: 2 picked', 'Bars: Removed level'])
  )
  expect(formatReportBreakdown({dimension: 'TEAM_LEVEL', levelName: null}, null)).toBe(
    'Removed level'
  )
  expect(formatReportBreakdown({dimension: 'TIME', levelName: null}, 'WEEK')).toBe('Week')
})
