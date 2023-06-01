import {datetime} from 'rrule'

export const getRRuleDateFromJSDate = (date: Date) => {
  return datetime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  )
}

export const getJSDateFromRRuleDate = (rruleDate: Date) => {
  return new Date(
    rruleDate.getUTCFullYear(),
    rruleDate.getUTCMonth(),
    rruleDate.getUTCDate(),
    rruleDate.getUTCHours(),
    rruleDate.getUTCMinutes()
  )
}
