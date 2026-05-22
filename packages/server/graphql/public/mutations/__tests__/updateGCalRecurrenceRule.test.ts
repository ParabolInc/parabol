// The analytics module pulls in Amplitude which references a webpack-injected
// `__PRODUCTION__` global at import time. Stub it out so we can import the
// mutation file purely for the pure helper we're testing.
jest.mock('../../../../utils/analytics/analytics', () => ({
  analytics: {
    recurrenceStarted: jest.fn(),
    recurrenceStopped: jest.fn()
  }
}))

import dayjs from 'dayjs'
import {RRuleSet} from 'rrule-rust'
import {updateGCalRecurrenceRule} from '../updateRecurrenceSettings'

// Pure helper that decides which rrule we patch into gcal. The two branches are:
//   - a new rule provided → use it as-is (rename/edit case)
//   - null/undefined → end the series by setting UNTIL=now on the existing rule
// Both branches feed `updateGcalSeries` and ultimately the gcal calendar event,
// so a regression here would silently corrupt the calendar invite.

const buildRRuleSet = () => {
  // Weekly on Mondays starting 2024-01-01 09:00 UTC
  return RRuleSet.parse(`DTSTART;TZID=UTC:20240101T090000
RRULE:FREQ=WEEKLY;BYDAY=MO`)
}

describe('updateGCalRecurrenceRule', () => {
  test('returns the new rule untouched when a new rule is provided', () => {
    const oldRule = buildRRuleSet()
    const newRule = RRuleSet.parse(`DTSTART;TZID=UTC:20240101T090000
RRULE:FREQ=DAILY`)

    const result = updateGCalRecurrenceRule(oldRule, newRule)

    expect(result).toBe(newRule)
    expect(result.toString()).toContain('FREQ=DAILY')
  })

  test('sets UNTIL=now on the old rule when newRule is null (cancel)', () => {
    const oldRule = buildRRuleSet()
    expect(oldRule.toString()).not.toContain('UNTIL')

    const result = updateGCalRecurrenceRule(oldRule, null)

    // rrule-rust returns a new instance; the original is left untouched
    expect(result).not.toBe(oldRule)
    expect(oldRule.toString()).not.toContain('UNTIL=')
    expect(result.toString()).toContain('UNTIL=')

    // UNTIL should be roughly "now" — within a 60s window of dayjs().
    const untilMatch = result.toString().match(/UNTIL=(\d{8}T\d{6})/)
    expect(untilMatch).not.toBeNull()
    const untilStr = untilMatch![1]!
    // Format YYYYMMDDTHHMMSS - parse to a Dayjs (UTC since tzid was UTC)
    const parsed = dayjs.utc(untilStr, 'YYYYMMDDTHHmmss')
    const driftSeconds = Math.abs(parsed.diff(dayjs.utc(), 'seconds'))
    expect(driftSeconds).toBeLessThan(60)
  })

  test('treats undefined the same as null (cancel)', () => {
    const oldRule = buildRRuleSet()
    const result = updateGCalRecurrenceRule(oldRule, undefined)
    expect(result.toString()).toContain('UNTIL=')
  })
})
