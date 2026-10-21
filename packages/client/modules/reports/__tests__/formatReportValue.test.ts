import {formatReportChange, formatReportValue} from '../formatReportValue'

test('a share is a percentage and a median keeps one decimal', () => {
  expect(formatReportValue('ACTIVE_SHARE', 66.7)).toBe('66.7%')
  expect(formatReportValue('ACTIVE_SHARE', 100)).toBe('100%')
  expect(formatReportValue('DAYS_TO_DONE', 1.5)).toBe('1.5')
  expect(formatReportValue('DAYS_TO_DONE', null)).toBe('—')
  expect(formatReportValue('MEETINGS', 1200)).toBe('1,200')
})

test('a share changes by points and a median by days', () => {
  expect(formatReportChange('ACTIVE_SHARE', -3.5)).toBe('3.5 points')
  expect(formatReportChange('DAYS_TO_DONE', 1)).toBe('1 day')
  expect(formatReportChange('MEETINGS', -4)).toBe('4')
})
