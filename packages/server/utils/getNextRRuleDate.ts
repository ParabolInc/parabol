import dayjs from 'dayjs'
import {fromDateTime, toDateTime} from 'parabol-client/shared/rruleUtil'
import {DateTime, RRuleSet} from 'rrule-rust'

export const getNextRRuleDate = (rrule: RRuleSet) => {
  const {tzid} = rrule
  const now = DateTime.fromString(toDateTime(dayjs(), tzid))
  const nextYear = DateTime.fromString(toDateTime(dayjs().add(1, 'year'), tzid))
  const nextDateTime = rrule.between(now, nextYear)[0]
  if (!nextDateTime) return null
  return fromDateTime(nextDateTime.toString(), tzid).toDate()
}
