import {RRuleSet} from 'rrule-rust'
import {getNextRRuleDate, getUpcomingRRuleDates} from '../getNextRRuleDate'

const WEEK = 7 * 24 * 60 * 60 * 1000

const makeWeeklyRRule = (startsInDays: number, rule = 'FREQ=WEEKLY') => {
  const dtstart = new Date(Date.now() + startsInDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '')
  return RRuleSet.parse(`DTSTART:${dtstart}\nRRULE:${rule}`)
}

test('getUpcomingRRuleDates returns the upcoming occurrences, soonest first', () => {
  const rrule = makeWeeklyRRule(2)
  const [first, second, ...rest] = getUpcomingRRuleDates(rrule, 2)
  expect(rest).toHaveLength(0)
  expect(first).toEqual(getNextRRuleDate(rrule))
  // a meeting started early runs until the occurrence *after* the upcoming one
  expect(second!.getTime() - first!.getTime()).toBe(WEEK)
})

test('getUpcomingRRuleDates returns fewer dates when the series runs out', () => {
  expect(getUpcomingRRuleDates(makeWeeklyRRule(2, 'FREQ=WEEKLY;COUNT=1'), 2)).toHaveLength(1)
})

test('getNextRRuleDate is null once the series has no occurrences left', () => {
  expect(getNextRRuleDate(makeWeeklyRRule(-30, 'FREQ=WEEKLY;COUNT=1'))).toBe(null)
})
