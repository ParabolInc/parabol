import {parseReportSpec} from '../parseReportSpec'

const cadence = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
  filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
  period: {preset: 'PAGE'},
  showAs: 'HEATMAP',
  sort: {by: 'VALUE', order: 'DESC'}
}

test('a spec comes back with every field, and missing ones filled in', () => {
  expect(parseReportSpec(cadence)).toEqual({
    ...cadence,
    where: [],
    period: {preset: 'PAGE', startDate: null, endDate: null},
    compareTo: null,
    limit: null
  })
})

test('fields Parabol does not know are dropped', () => {
  const spec = parseReportSpec({
    ...cadence,
    owner: 'someone',
    breakdown: [{dimension: 'TEAM', levelId: 'businessUnit'}, {dimension: 'MONTH'}]
  })
  expect(spec).not.toHaveProperty('owner')
  expect(spec?.breakdown).toEqual([{dimension: 'TEAM'}, {dimension: 'MONTH'}])
})

test('a team structure breakdown or filter keeps the level it names', () => {
  const spec = parseReportSpec({
    ...cadence,
    breakdown: [{dimension: 'TEAM_LEVEL', levelId: 'level1'}, {dimension: 'MONTH'}],
    filters: [{dimension: 'TEAM_LEVEL', levelId: 'level2', values: ['notSet']}]
  })
  expect(spec?.breakdown[0]).toEqual({dimension: 'TEAM_LEVEL', levelId: 'level1'})
  expect(spec?.filters).toEqual([{dimension: 'TEAM_LEVEL', levelId: 'level2', values: ['notSet']}])
})

test.each([
  ['not an object', 'MEETINGS'],
  ['an unknown measure', {...cadence, measures: ['VELOCITY']}],
  [
    'an unknown dimension',
    {...cadence, breakdown: [{dimension: 'BUSINESS_UNIT'}, {dimension: 'MONTH'}]}
  ],
  ['a filter value that is not text', {...cadence, filters: [{dimension: 'TEAM', values: [1]}]}],
  [
    'a condition without a number',
    {...cadence, where: [{measure: 'MEETINGS', operator: 'AT_LEAST', value: '1'}]}
  ],
  ['an unknown period', {...cadence, period: {preset: 'THIS_QUARTER'}}],
  ['an unknown view', {...cadence, showAs: 'PIE'}],
  ['a sort without a direction it knows', {...cadence, sort: {by: 'VALUE', order: 'UP'}}],
  ['a limit that is not a number', {...cadence, limit: '8'}],
  ['a spec that breaks a rule', {...cadence, showAs: 'NUMBER'}]
])('%s is not a spec', (_name, value) => {
  expect(parseReportSpec(value)).toBeNull()
})
