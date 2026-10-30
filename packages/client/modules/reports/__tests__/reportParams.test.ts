import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {
  readReportAddress,
  toReportPagePath,
  toReportPinPath,
  toReportsHomePath
} from '../reportPaths'
import {parseReportPeriodParam, toReportPeriodParam} from '../reportPeriodParam'
import {readReportSpecParams} from '../reportSpecParam'

const cadence: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
  filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
  where: [],
  period: null,
  compareTo: null,
  showAs: 'HEATMAP',
  sort: {by: 'VALUE', order: 'DESC'},
  limit: null
}

test('a period round-trips through the address, and the default stays out of it', () => {
  expect(parseReportPeriodParam(null)).toEqual({preset: 'LAST_3_MONTHS'})
  expect(toReportPeriodParam({preset: 'LAST_3_MONTHS'})).toBeNull()
  expect(parseReportPeriodParam('7d')).toEqual({preset: 'LAST_7_DAYS'})
  expect(toReportPeriodParam({preset: 'ALL_TIME'})).toBe('all')
  const range = {range: {startAt: '2026-09-01', endAt: '2026-09-15'}}
  expect(parseReportPeriodParam(toReportPeriodParam(range))).toEqual(range)
})

test('a period the address mangled falls back to the default', () => {
  expect(parseReportPeriodParam('quarter')).toEqual({preset: 'LAST_3_MONTHS'})
  expect(parseReportPeriodParam('2026-09-15_2026-09-01')).toEqual({preset: 'LAST_3_MONTHS'})
})

const withEverything: ReportSpec = {
  measures: ['DISCUSSIONS', 'NEW_TASKS'],
  breakdown: [
    {dimension: 'TEAM_LEVEL', levelId: 'OrgStructureLevel:3235980045'},
    {dimension: 'WEEK'}
  ],
  filters: [
    {
      dimension: 'TEAM_LEVEL',
      levelId: 'OrgStructureLevel:3235980045',
      values: ['Platform', 'R&D, Ops']
    },
    {dimension: 'MEETING_TYPE', values: ['retrospective', 'action']}
  ],
  where: [{measure: 'DISCUSSIONS', operator: 'AT_LEAST', value: 2.5}],
  period: {range: {startAt: '2026-09-01', endAt: '2026-09-30'}},
  compareTo: 'PREVIOUS_PERIOD',
  showAs: 'TABLE',
  sort: {by: 'NAME', order: null},
  limit: 10
}

const toParams = (path: string) => new URL(path, 'https://x').searchParams

test('a spec round-trips through readable params, leaving out its defaults', () => {
  const path = toReportPagePath('org1', cadence, {preset: 'LAST_3_MONTHS'})
  expect(path).toBe(
    '/reports/org1/report?measure=meetings&by=team,month&meeting-type=retrospective&sort=value-desc&view=heatmap'
  )
  expect(readReportAddress(toParams(path))).toEqual({spec: cadence, reportQuestionId: null})
})

test('every part of a spec round-trips, including structure levels and values with commas', () => {
  const path = toReportPagePath('org1', withEverything, {preset: 'LAST_3_MONTHS'})
  expect(path).toContain('by=level-3235980045,week')
  expect(path).toContain('where=discussions.at-least.2.5')
  expect(path).toContain('range=2026-09-01_2026-09-30')
  expect(readReportAddress(toParams(path))?.spec).toEqual(withEverything)
})

test('a link that was cut short or edited holds no spec', () => {
  expect(readReportSpecParams(new URLSearchParams('measure=meetings'))).toBeNull()
  expect(readReportSpecParams(new URLSearchParams('measure=nonsense&view=table'))).toBeNull()
  expect(
    readReportSpecParams(new URLSearchParams('measure=meetings&view=table&range=soon'))
  ).toBeNull()
  expect(readReportSpecParams(new URLSearchParams())).toBeNull()
})

test('the answer to a question stays in the Reports page’s address, with the period', () => {
  const answer = {spec: cadence, reportQuestionId: 'ReportQuestion:1'}
  const home = toReportsHomePath('org1', {preset: 'LAST_7_DAYS'}, answer)
  expect(home).toContain('question=ReportQuestion:1')
  expect(new URL(home, 'https://x').pathname).toBe('/reports/org1')
  expect(toParams(home).get('period')).toBe('7d')
  expect(readReportAddress(toParams(home))).toEqual(answer)
  expect(toReportsHomePath('org1', {preset: 'LAST_3_MONTHS'})).toBe('/reports/org1')
})

test('a pin opens by the last part of its id', () => {
  expect(toReportPinPath('org1', 'PinnedReport:42', {preset: 'LAST_3_MONTHS'})).toBe(
    '/reports/org1/pins/42'
  )
  expect(
    toReportPinPath('org1', 'BuiltInPinnedReport:org1:activeUsers', {preset: 'ALL_TIME'})
  ).toBe('/reports/org1/pins/activeUsers?period=all')
})
