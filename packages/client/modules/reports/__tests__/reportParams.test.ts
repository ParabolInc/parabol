import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {readReportAddress, toReportPagePath, toReportsHomePath} from '../reportPaths'
import {parseReportPeriodParam, toReportPeriodParam} from '../reportPeriodParam'
import {decodeReportSpec, encodeReportSpec} from '../reportSpecParam'

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

test('a spec round-trips through the address', () => {
  const param = encodeReportSpec(cadence)
  expect(param).toMatch(/^[A-Za-z0-9_-]+$/)
  expect(decodeReportSpec(param)).toEqual(cadence)
})

test('a link that was cut short or edited holds no spec', () => {
  const param = encodeReportSpec(cadence)
  expect(decodeReportSpec(param.slice(0, 20))).toBeNull()
  expect(decodeReportSpec('not a spec')).toBeNull()
  expect(decodeReportSpec(null)).toBeNull()
})

test('the answer to a question stays in the Reports page’s address, with the period', () => {
  const answer = {spec: cadence, title: 'Retro cadence', reportQuestionId: 'ReportQuestion:1'}
  const home = new URL(toReportsHomePath('org1', {preset: 'LAST_7_DAYS'}, answer), 'https://x')
  expect(home.pathname).toBe('/reports/org1')
  expect(home.searchParams.get('period')).toBe('7d')
  expect(readReportAddress(home.searchParams)).toEqual(answer)
  expect(toReportsHomePath('org1', {preset: 'LAST_3_MONTHS'})).toBe('/reports/org1')
  const page = new URL(
    toReportPagePath('org1', cadence, null, {preset: 'LAST_3_MONTHS'}),
    'https://x'
  )
  expect(page.pathname).toBe('/reports/org1/report')
  expect(readReportAddress(page.searchParams)).toEqual({
    spec: cadence,
    title: null,
    reportQuestionId: null
  })
})
