import type {ReportSpec} from '../../../shared/reports/reportCatalog'
import {parseReportPeriodParam, toReportPeriodParam} from '../reportPeriodParam'
import {decodeReportSpec, encodeReportSpec} from '../reportSpecParam'

const cadence: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'MONTH'}],
  filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
  where: [],
  period: {preset: 'PAGE', startDate: null, endDate: null},
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
  const range = {startDate: '2026-09-01', endDate: '2026-09-15'}
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
