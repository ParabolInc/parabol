import {REPORT_HIDDEN_VALUE, type ReportSpec} from '../../../shared/reports/reportCatalog'
import {toReportCSV} from '../reportCSV'

const spec: ReportSpec = {
  measures: ['MEETINGS', 'LAST_MEETING'],
  breakdown: [{dimension: 'TEAM'}],
  filters: [],
  where: [],
  period: null,
  compareTo: null,
  showAs: 'TABLE',
  sort: null,
  limit: null
}

const row = (label: string, values: (number | null)[]) => ({
  keys: [{value: label, label, isPartial: false}],
  values,
  previousValues: null
})

test('a table becomes CSV with a header, dates as days and quotes where needed', () => {
  const csv = toReportCSV(spec, ['Team'], null, [
    row('Core Infra', [6, Date.UTC(2026, 6, 17)]),
    row('Data, Platform', [3, null])
  ])
  expect(csv.split('\r\n')).toEqual([
    'Team,Meetings,Last meeting',
    'Core Infra,6,2026-07-17',
    '"Data, Platform",3,'
  ])
})

test('a name a spreadsheet would run as a formula is quoted', () => {
  const csv = toReportCSV(spec, ['Team'], null, [row('=HYPERLINK("x")', [1, null])])
  expect(csv.split('\r\n')[1]).toBe(`"'=HYPERLINK(""x"")",1,`)
})

test('a value held back for anonymity says so, unlike one with no data', () => {
  const csv = toReportCSV(spec, ['Team'], null, [row('Design', [REPORT_HIDDEN_VALUE, null])])
  expect(csv.split('\r\n')[1]).toBe('Design,Hidden,')
})
