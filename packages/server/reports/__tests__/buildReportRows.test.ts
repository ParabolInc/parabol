import buildReportRows from '../buildReportRows'
import type {ReportLevelDimension} from '../teamStructure'

const BUSINESS_UNIT: ReportLevelDimension = 'level:1'
const DEPARTMENT: ReportLevelDimension = 'level:2'
const PLACEMENTS: Record<ReportLevelDimension, Record<string, string>> = {
  [BUSINESS_UNIT]: {platform: 'unitPlatform', custody: 'unitCustody'},
  [DEPARTMENT]: {platform: 'deptEngineering', custody: 'deptEngineering'}
}
const LEVEL_VALUES: Record<ReportLevelDimension, {value: string; label: string}[]> = {
  [BUSINESS_UNIT]: [
    {value: 'unitPlatform', label: 'Platform'},
    {value: 'unitCustody', label: 'Custody'},
    {value: 'notSet', label: 'Not set'}
  ],
  [DEPARTMENT]: [
    {value: 'deptEngineering', label: 'Engineering'},
    {value: 'deptOperations', label: 'Operations'}
  ]
}

const build = (breakdown: (ReportLevelDimension | 'TEAM')[]) =>
  buildReportRows({
    breakdown,
    measures: ['MEETINGS'],
    steps: null,
    previousStepCount: 0,
    teams: [
      {id: 'platform', name: 'Platform Apps'},
      {id: 'custody', name: 'Custody Ops'},
      {id: 'venues', name: 'Venues'}
    ],
    filters: [],
    current: [{rows: [], estimatedCount: 0, labels: {}, hiddenTeamIds: []}],
    previous: null,
    levelValuesOf: (dimension) => LEVEL_VALUES[dimension] ?? [],
    teamValueOf: (dimension, teamId) => PLACEMENTS[dimension]?.[teamId] ?? 'notSet'
  })

const keysOf = (rows: ReturnType<typeof build>) =>
  typeof rows === 'string' ? rows : rows.map(({keys}) => keys.map(({value}) => value))

test('a team only gets a row under the team structure value it sits at', () => {
  expect(keysOf(build([BUSINESS_UNIT, 'TEAM']))).toEqual([
    ['unitPlatform', 'platform'],
    ['unitCustody', 'custody'],
    ['notSet', 'venues']
  ])
})

test('two levels only pair the values some team holds', () => {
  expect(keysOf(build([BUSINESS_UNIT, DEPARTMENT]))).toEqual([
    ['unitPlatform', 'deptEngineering'],
    ['unitCustody', 'deptEngineering']
  ])
})

test('one level still lists every value', () => {
  expect(keysOf(build([BUSINESS_UNIT]))).toEqual([['unitPlatform'], ['unitCustody'], ['notSet']])
})
