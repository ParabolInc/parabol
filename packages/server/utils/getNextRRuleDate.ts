import dayjs, {type Dayjs} from 'dayjs'
import {fromDateTime} from 'parabol-client/shared/rruleUtil'
import {DateTime, type RRuleSet} from 'rrule-rust'

// Bounds are passed in UTC: rrule-rust rejects a wall-clock time in the rule's timezone that falls
// in the hour a DST change repeats, because it's ambiguous.
export const toUTCDateTime = (date: Dayjs) =>
  DateTime.fromString(date.utc().format('YYYYMMDD[T]HHmmss[Z]'))

// The upcoming occurrences of the rule, soonest first. Fewer than `limit` are returned when the
// series runs out (COUNT/UNTIL) within the next year.
export const getUpcomingRRuleDates = (rrule: RRuleSet, limit: number) => {
  const {tzid} = rrule
  const now = dayjs()
  return rrule
    .between(toUTCDateTime(now), toUTCDateTime(now.add(1, 'year')))
    .slice(0, limit)
    .map((dateTime) => fromDateTime(dateTime.toString(), tzid).toDate())
}

export const getNextRRuleDate = (rrule: RRuleSet) => {
  return getUpcomingRRuleDates(rrule, 1)[0] ?? null
}
