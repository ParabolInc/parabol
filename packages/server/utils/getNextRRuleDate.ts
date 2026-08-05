import dayjs from 'dayjs'
import {fromDateTime, toDateTime} from 'parabol-client/shared/rruleUtil'
import {DateTime, type RRuleSet} from 'rrule-rust'

// The upcoming occurrences of the rule, soonest first. Fewer than `limit` are returned when the
// series runs out (COUNT/UNTIL) within the next year.
export const getUpcomingRRuleDates = (rrule: RRuleSet, limit: number) => {
  const {tzid} = rrule
  const now = DateTime.fromString(toDateTime(dayjs(), tzid))
  const nextYear = DateTime.fromString(toDateTime(dayjs().add(1, 'year'), tzid))
  return rrule
    .between(now, nextYear)
    .slice(0, limit)
    .map((dateTime) => fromDateTime(dateTime.toString(), tzid).toDate())
}

export const getNextRRuleDate = (rrule: RRuleSet) => {
  return getUpcomingRRuleDates(rrule, 1)[0] ?? null
}
