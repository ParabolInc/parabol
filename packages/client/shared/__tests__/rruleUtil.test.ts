import dayjs from 'dayjs'
import {fromDateTime, toDateTime} from '../rruleUtil'

test('toDateTime: Should handle TZID', () => {
  // at noon UTC what time is it in Phoenix?
  const now = dayjs('2022-01-01T12:00:00Z')
  const tzid = 'America/Phoenix'
  const str = toDateTime(now, tzid)
  expect(str).toBe('20220101T050000')
})

test('toDateTime: Should handle UTC TZID', () => {
  // at noon UTC what time is it in UTC?
  const now = dayjs('2022-01-01T12:00:00Z')
  const tzid = 'UTC'
  const str = toDateTime(now, tzid)
  expect(str).toBe('20220101T120000')
})

test('fromDateTime: Should handle TZID', () => {
  const dateTimeStr = '20220101T050000'
  const tzid = 'America/Phoenix'
  const day = fromDateTime(dateTimeStr, tzid)
  expect(day.toISOString()).toBe('2022-01-01T12:00:00.000Z')
})

test('fromDateTime: Should handle UTC TZID', () => {
  const dateTimeStr = '20220101T050000'
  const tzid = 'UTC'
  const day = fromDateTime(dateTimeStr, tzid)
  expect(day.toISOString()).toBe('2022-01-01T05:00:00.000Z')
})
