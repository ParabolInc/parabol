import {REPORT_HIDDEN_VALUE} from '../../../shared/reports/reportCatalog'
import {sumReportValues, withoutHiddenValues} from '../reportRows'

test('a hidden value adds nothing to a total', () => {
  expect(sumReportValues([4, REPORT_HIDDEN_VALUE, null, 2])).toBe(6)
})

test('charts draw a hidden value, now or before, as nothing', () => {
  const [row] = withoutHiddenValues([
    {
      keys: [{value: 'markets', label: 'Markets', isPartial: false}],
      values: [REPORT_HIDDEN_VALUE, 3.5],
      previousValues: [2.1, REPORT_HIDDEN_VALUE]
    }
  ])
  expect(row?.values).toEqual([null, 3.5])
  expect(row?.previousValues).toEqual([2.1, null])
})
