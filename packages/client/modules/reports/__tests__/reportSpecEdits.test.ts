import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {
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
  period: {preset: 'PAGE', startDate: null, endDate: null},
  compareTo: null,
  showAs: 'NUMBER',
  sort: null,
  limit: null,
  ...overrides
})

const teams = [{id: 'team1', name: 'Core Infra'}]

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
  const {removal} = breakdownEdits(byTeam, 0)
  expect(removal).toMatchObject({breakdown: [], sort: null, limit: null})
  expect(
    breakdownEdits(spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]}), 0).removal
  ).toBeNull()
})

test('clearing a filter’s last value removes the filter', () => {
  const retros = spec({filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}]})
  const {options, removal} = filterEdits(retros, 0, teams)
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
  expect(addFilterEdits(members, teams).map(({dimension}) => dimension)).toEqual(['TEAM'])
  const filtered = spec({filters: [{dimension: 'TEAM', values: ['team1']}]})
  expect(addFilterEdits(filtered, teams).map(({dimension}) => dimension)).toEqual(['MEETING_TYPE'])
})

test('a view that can’t show the breakdown is offered but can’t be picked', () => {
  const byTeam = spec({showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]})
  expect(validKeys(viewEdits(byTeam))).toEqual(['BARS', 'TABLE'])
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
