import dayjs, {Dayjs} from 'dayjs'
import customParsePlugin from 'dayjs/plugin/customParseFormat'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import {datetime} from 'rrule'

dayjs.extend(customParsePlugin)
dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)

// THIS IS WRONG! It should use UTC instead of local time
export const getRRuleDateFromJSDate = (date: Date) => {
  return datetime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  )
}

// THIS IS REALLY WRONG! it's gonna offset the time by the negative UTC offset
export const getJSDateFromRRuleDate = (rruleDate: Date) => {
  return new Date(
    rruleDate.getUTCFullYear(),
    rruleDate.getUTCMonth(),
    rruleDate.getUTCDate(),
    rruleDate.getUTCHours(),
    rruleDate.getUTCMinutes()
  )
}

export const toDateTime = (date: Dayjs, tzid: string) => {
  return tzid
    ? date.tz(tzid).format('YYYYMMDD[T]HHmmss')
    : date.utc().format('YYYYMMDD[T]HHmmss[Z]')
}

export const fromDateTime = (rfc5545String: string, tzid: string) => {
  const rawDate = dayjs.utc(rfc5545String, 'YYYYMMDD[T]HHmmss')
  return tzid ? dayjs.tz(rawDate.format('YYYY-MM-DD HH:mm'), tzid) : rawDate
}
