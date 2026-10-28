import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {
  addBreakdownEdits,
  addFilterEdits,
  breakdownEdits,
  filterEdits,
  measureEdits,
  sortEdits,
  viewEdits
} from '../reportSpecEdits'

const spec = (overrides: Partial<ReportSpec>): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [],
  filters: [],
  where: [],
  period: null,
  compareTo: null,
  showAs: 'NUMBER',
  sort: null,
  limit: null,
  ...overrides
})

const teams = [{id: 'team1', name: 'Core Infra'}]

const LEVELS = [
  {id: 'level1', name: 'Business unit', values: [{id: 'value1', name: 'Platform'}]},
  {id: 'level2', name: 'Region', values: [{id: 'value2', name: 'EMEA'}]}
]

const validKeys = (options: {key: string; isValid: boolean}[]) =>
  options.filter(({isValid}) => isValid).map(({key}) => key)

test('a measure that can’t split the way the report does can’t be picked', () => {
  const byType = spec({showAs: 'BARS', breakdown: [{dimension: 'MEETING_TYPE'}]})
  const {options, isMulti} = measureEdits(byType)
  expect(isMulti).toBe(false)
  expect(validKeys(options)).toContain('NEW_TASKS')
  expect(validKeys(options)).not.toContain('MEMBERS')
})

test('a table’s measures toggle', () => {
  const {options, isMulti} = measureEdits(
    spec({showAs: 'TABLE', measures: ['MEETINGS', 'DISCUSSIONS']})
  )
  expect(isMulti).toBe(true)
  expect(options.find(({key}) => key === 'DISCUSSIONS')?.spec.measures).toEqual(['MEETINGS'])
  expect(options.find(({key}) => key === 'NEW_TASKS')?.spec.measures).toEqual([
    'MEETINGS',
    'DISCUSSIONS',
    'NEW_TASKS'
  ])
})

test('removing a breakdown drops the sort and limit it leaves without a purpose', () => {
  const byTeam = spec({
    showAs: 'TABLE',
    breakdown: [{dimension: 'TEAM'}],
    sort: {by: 'NAME', order: 'ASC'},
    limit: 8
  })
  const {removal} = breakdownEdits(byTeam, 0, [])
  expect(removal).toMatchObject({breakdown: [], sort: null, limit: null})
  expect(
    breakdownEdits(spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]}), 0, []).removal
  ).toBeNull()
})

test('clearing a filter’s last value removes the filter', () => {
  const retros = spec({filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}]})
  const {options, removal} = filterEdits(retros, 0, teams, [])
  expect(options.find(({key}) => key === 'retrospective')).toMatchObject({
    isSelected: true,
    spec: {filters: []}
  })
  expect(options.find(({key}) => key === 'poker')?.spec.filters).toEqual([
    {dimension: 'MEETING_TYPE', values: ['retrospective', 'poker']}
  ])
  expect(removal?.filters).toEqual([])
})

test('a filter can only be added on a dimension the measure has, and not twice', () => {
  const members = spec({measures: ['MEMBERS']})
  expect(addFilterEdits(members, teams, []).map(({key}) => key)).toEqual(['TEAM'])
  const filtered = spec({filters: [{dimension: 'TEAM', values: ['team1']}]})
  expect(addFilterEdits(filtered, teams, []).map(({key}) => key)).toEqual(['MEETING_TYPE'])
})

test('each org structure level is a breakdown and a filter of its own', () => {
  const byUnit = spec({
    showAs: 'BARS',
    breakdown: [{dimension: 'TEAM_LEVEL', levelId: 'level1'}]
  })
  const {options} = breakdownEdits(byUnit, 0, LEVELS)
  expect(options.find(({isSelected}) => isSelected)?.label).toBe('Business unit')
  expect(options.find(({key}) => key === 'TEAM_LEVEL:level2')?.spec.breakdown).toEqual([
    {dimension: 'TEAM_LEVEL', levelId: 'level2'}
  ])
  expect(options.map(({key}) => key)).not.toContain('TEAM_LEVEL')
  const addable = addBreakdownEdits(byUnit, LEVELS).map(({key}) => key)
  expect(addable).toContain('TEAM_LEVEL:level2')
  expect(addable).not.toContain('TEAM_LEVEL:level1')
  const unitFilter = addFilterEdits(spec({}), teams, LEVELS).find(
    ({key}) => key === 'TEAM_LEVEL:level1'
  )
  expect(unitFilter?.options.map(({label}) => label)).toEqual(['Platform', 'Not set'])
  expect(unitFilter?.options[0]?.spec.filters).toEqual([
    {dimension: 'TEAM_LEVEL', levelId: 'level1', values: ['value1']}
  ])
})

test('a view gets the breakdowns it needs', () => {
  const byTeam = spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]})
  const views = viewEdits(byTeam)
  const breakdownOf = (view: string) => views.find(({key}) => key === view)?.spec.breakdown
  expect(validKeys(views)).toEqual(['NUMBER', 'LINE', 'BARS', 'HEATMAP', 'TABLE'])
  expect(breakdownOf('NUMBER')).toEqual([])
  expect(breakdownOf('LINE')).toEqual([{dimension: 'TIME'}, {dimension: 'TEAM'}])
  expect(breakdownOf('HEATMAP')).toEqual([{dimension: 'TEAM'}, {dimension: 'TIME'}])
})

test('Health score opens the Team Health heatmap, under the team structure level the report split by', () => {
  const activeByUnit = spec({
    measures: ['ACTIVE_USERS'],
    showAs: 'LINE',
    breakdown: [{dimension: 'TIME'}, {dimension: 'TEAM_LEVEL', levelId: 'level1'}]
  })
  const health = measureEdits(activeByUnit).options.find(({key}) => key === 'HEALTH_SCORE')
  expect(health?.isValid).toBe(true)
  expect(health?.spec).toMatchObject({
    showAs: 'HEATMAP',
    compareTo: 'PREVIOUS_CHECK',
    breakdown: [
      {dimension: 'TEAM_LEVEL', levelId: 'level1'},
      {dimension: 'TEAM'},
      {dimension: 'CATEGORY'}
    ]
  })
})

test('a line that becomes a heatmap keeps time as its columns', () => {
  const healthOverTime = spec({
    measures: ['HEALTH_SCORE'],
    showAs: 'LINE',
    breakdown: [{dimension: 'TIME'}, {dimension: 'TEAM'}]
  })
  expect(viewEdits(healthOverTime).find(({key}) => key === 'HEATMAP')?.spec.breakdown).toEqual([
    {dimension: 'TEAM'},
    {dimension: 'TIME'}
  ])
})

test('Health score bars become a heatmap by category', () => {
  const healthByUnit = spec({
    measures: ['HEALTH_SCORE'],
    showAs: 'BARS',
    breakdown: [{dimension: 'TEAM_LEVEL', levelId: 'level1'}]
  })
  const unit = {dimension: 'TEAM_LEVEL', levelId: 'level1'}
  expect(viewEdits(healthByUnit).find(({key}) => key === 'HEATMAP')?.spec.breakdown).toEqual([
    unit,
    {dimension: 'CATEGORY'}
  ])
  const added = addBreakdownEdits(healthByUnit, LEVELS)
  expect(added.find(({key}) => key === 'TEAM')?.spec).toMatchObject({
    showAs: 'HEATMAP',
    breakdown: [unit, {dimension: 'TEAM'}, {dimension: 'CATEGORY'}]
  })
})

test('a Health score heatmap adds rows before its categories, team structure levels before teams', () => {
  const healthByTeam = spec({
    measures: ['HEALTH_SCORE'],
    showAs: 'HEATMAP',
    breakdown: [{dimension: 'TEAM'}, {dimension: 'CATEGORY'}],
    compareTo: 'PREVIOUS_CHECK'
  })
  const byUnit = addBreakdownEdits(healthByTeam, LEVELS).find(
    ({key}) => key === 'TEAM_LEVEL:level1'
  )
  expect(byUnit?.spec.breakdown).toEqual([
    {dimension: 'TEAM_LEVEL', levelId: 'level1'},
    {dimension: 'TEAM'},
    {dimension: 'CATEGORY'}
  ])
  const byMonth = breakdownEdits(healthByTeam, 1, LEVELS).options.find(({key}) => key === 'MONTH')
  expect(byMonth?.isValid).toBe(true)
  expect(byMonth?.spec.compareTo).toBeNull()
})

test('a date sorts by age, and only sorts that fit are offered', () => {
  const lastMeeting = spec({
    measures: ['LAST_MEETING'],
    showAs: 'TABLE',
    breakdown: [{dimension: 'TEAM'}]
  })
  expect(sortEdits(lastMeeting).map(({label}) => label)).toEqual([
    'Default',
    'Newest first',
    'Oldest first',
    'A to Z',
    'Z to A'
  ])
})
