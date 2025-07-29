import {Frequency, RRule, type Weekday} from 'rrule'
import plural from './plural'

export type DayFullName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type Day = {
  name: DayFullName
  shortName: string
  abbreviation: string
  rruleVal: Weekday
  intVal: number
  isWeekday: boolean
}

export const ALL_DAYS: Day[] = [
  {
    name: 'Monday',
    shortName: 'Mon',
    abbreviation: 'M',
    rruleVal: RRule.MO,
    intVal: 0,
    isWeekday: true
  },
  {
    name: 'Tuesday',
    shortName: 'Tue',
    abbreviation: 'T',
    rruleVal: RRule.TU,
    intVal: 1,
    isWeekday: true
  },
  {
    name: 'Wednesday',
    shortName: 'Wed',
    abbreviation: 'W',
    rruleVal: RRule.WE,
    intVal: 2,
    isWeekday: true
  },
  {
    name: 'Thursday',
    shortName: 'Thu',
    abbreviation: 'T',
    rruleVal: RRule.TH,
    intVal: 3,
    isWeekday: true
  },
  {
    name: 'Friday',
    shortName: 'Fri',
    abbreviation: 'F',
    rruleVal: RRule.FR,
    intVal: 4,
    isWeekday: true
  },
  {
    name: 'Saturday',
    shortName: 'Sat',
    abbreviation: 'S',
    rruleVal: RRule.SA,
    intVal: 5,
    isWeekday: false
  },
  {
    name: 'Sunday',
    shortName: 'Sun',
    abbreviation: 'S',
    rruleVal: RRule.SU,
    intVal: 6,
    isWeekday: false
  }
]

export const lowerCase = (str: string, posToChange: number) => {
  if (posToChange < 0 || posToChange >= str.length) return str
  const lowered = str[posToChange]!.toLowerCase()
  return str.slice(0, posToChange) + lowered + str.slice(posToChange + 1)
}

type HumanReadableOptions = {
  isPartOfSentence?: boolean
  useShortNames?: boolean
  shortDayNameAfter?: number
}

/**
 * Converts an RRule to a human readable string
 * 1. If the rule is undefined OR there are no days selected, returns 'Will not restart'
 * 2. If all the days are selected, returns 'Every day'
 * 3. If all the weekdays are selected, returns 'Every weekday'
 * Interval string is only added if the interval is greater than 1 ie. 'Every 2 weeks'
 */
export const toHumanReadable = (
  rrule?: RRule,
  {
    isPartOfSentence = false,
    useShortNames = false,
    shortDayNameAfter = 3
  }: HumanReadableOptions = {}
) => {
  const generateHumanReadableText = (rrule: RRule) => {
    if (!rrule || rrule.options.byweekday.length === 0) return 'Will not restart'

    const {freq, byweekday, interval} = rrule.options
    if (freq !== Frequency.WEEKLY) throw new Error('Unsupported frequency')

    const intervalString = interval === 1 ? '' : `${interval} ${plural(interval, 'week')}`
    const selectedDays = ALL_DAYS.filter((day) => byweekday.includes(day.intVal))
    const selectedDaysCount = selectedDays.length

    if (selectedDaysCount === ALL_DAYS.length)
      return interval > 1 ? `Every ${intervalString}, every day` : 'Every day'
    if (selectedDaysCount === 5 && selectedDays.every((day) => day.isWeekday))
      return interval > 1 ? `Every ${intervalString} on weekdays` : 'Every weekday'

    const formatter =
      Intl.ListFormat !== undefined
        ? new Intl.ListFormat('en', {style: 'long', type: 'conjunction'})
        : {format: (arr: string[]) => arr.join(', ')} // fallback for safari pre Big Sur

    const formatted = formatter.format(
      selectedDays.map((day) =>
        useShortNames && selectedDaysCount > shortDayNameAfter ? day.shortName : day.name
      )
    )
    return interval > 1 ? `Every ${intervalString} on ${formatted}` : `Every ${formatted}`
  }

  const humanReadableText = generateHumanReadableText(rrule!)
  if (isPartOfSentence) {
    return lowerCase(humanReadableText, 0)
  }

  return humanReadableText
}
