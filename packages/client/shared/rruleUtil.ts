import dayjs, {Dayjs} from 'dayjs'
import customParsePlugin from 'dayjs/plugin/customParseFormat'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import {RRule} from 'rrule'

dayjs.extend(customParsePlugin)
dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)

// the RRule package requires dstart to be a date object set to a negative UTC offset. It's ugly!
export const toRRuleDateTime = (date: Dayjs) => {
  return date.tz('UTC', true).toDate()
}

export const fromRRuleDateTime = (rrule: RRule) => {
  const {options} = rrule
  const {dtstart, tzid} = options
  const tzidTimeStr = `${dtstart.getUTCFullYear()}-${dtstart.getUTCMonth() + 1}-${dtstart.getUTCDate()} ${dtstart.getUTCHours()}:${dtstart.getUTCMinutes()}`
  return tzid ? dayjs.tz(tzidTimeStr, tzid) : dayjs(tzidTimeStr)
}

// These are used by rrule-rust on the server, which has a special DateTime object
export const toDateTime = (date: Dayjs, tzid: string) => {
  return tzid
    ? date.tz(tzid).format('YYYYMMDD[T]HHmmss')
    : date.utc().format('YYYYMMDD[T]HHmmss[Z]')
}

export const fromDateTime = (rfc5545String: string, tzid: string) => {
  const rawDate = dayjs.utc(rfc5545String, 'YYYYMMDD[T]HHmmss')
  return tzid ? dayjs.tz(rawDate.format('YYYY-MM-DD HH:mm'), tzid) : rawDate
}
