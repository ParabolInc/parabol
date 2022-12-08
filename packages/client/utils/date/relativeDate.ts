// mostly copied from https://github.com/lukeed/fromnow/blob/master/src/index.js
// added `now` option
// capitalized J in just now
// set my own defaults

import plural from '../plural'

const SECOND = 1000
const MIN = SECOND * 60
const HOUR = MIN * 60
const DAY = HOUR * 24
const YEAR = DAY * 365
const MONTH = DAY * 30

interface Opts {
  max?: number
  zero?: boolean
  and?: boolean
  suffix?: boolean
  now?: string | Date | null
  smallDiff?: string
}

/**
 * Creates a human-readable string representing the time till the given date,
 * for example: 2 days; 13 hours; 2 days, etc or null if the date is in the past
 * @param date
 */
export const humanReadableCountdown = (date: string | Date) => {
  const now = new Date()
  const abs = new Date(date).getTime() - now.getTime()
  if (abs < 0) return null
  const periods = {
    d: (abs % MONTH) / DAY,
    h: (abs % DAY) / HOUR,
    m: (abs % HOUR) / MIN,
    s: (abs % MIN) / SECOND
  } as const

  const days = Math.floor(periods['d'])
  if (days > 0) {
    return `${days} ${plural(days, 'day', 'days')}`
  }

  const hours = Math.floor(periods['h'])
  if (hours > 0) {
    return `${hours} ${plural(hours, 'hour', 'hours')}`
  }

  const minutes = Math.floor(periods['m'])
  if (minutes > 0) {
    return `${minutes} ${plural(minutes, 'minute', 'minutes')}`
  }

  const seconds = Math.floor(periods['s'])
  if (seconds > 0) {
    return `${seconds} ${plural(seconds, 'second', 'seconds')}`
  }

  return null
}

export const countdown = (date: string | Date) => {
  const now = new Date()
  const abs = new Date(date).getTime() - now.getTime()
  if (abs < 0) return null
  const periods = {
    d: (abs % MONTH) / DAY,
    h: (abs % DAY) / HOUR,
    m: (abs % HOUR) / MIN,
    s: (abs % MIN) / SECOND
  } as const
  const keep: string[] = []

  for (const k in periods) {
    const val = String(Math.floor(periods[k as keyof typeof periods]))
    if (val === '0' && keep.length === 0 && k !== 'm') continue
    keep.push(keep.length === 0 ? val : val.padStart(2, '0'))
  }
  return keep.join(':')
}

const relativeDate = (date: string | Date, opts: Opts = {}) => {
  const now = opts.now ? new Date(opts.now) : new Date()
  const del = new Date(date).getTime() - now.getTime()
  const abs = Math.abs(del)

  if (abs < MIN) return opts.smallDiff === undefined ? 'Just now' : opts.smallDiff

  const periods = {
    year: abs / YEAR,
    month: (abs % YEAR) / MONTH,
    day: (abs % MONTH) / DAY,
    hour: (abs % DAY) / HOUR,
    minute: (abs % HOUR) / MIN
  } as const

  let k: number | string
  let val: number | string
  const keep: string[] = []
  let max: number | string = opts.max === undefined ? 1 : opts.max

  for (k in periods) {
    if (keep.length < max) {
      val = Math.floor(periods[k as keyof typeof periods] as number)
      if (!val && !opts.zero) continue
      keep.push(val + ' ' + (val === 1 ? k : k + 's'))
    }
  }

  k = keep.length // reuse
  max = ', ' // reuse

  if (k > 1 && opts.and) {
    if (k === 2) max = ' '
    keep[--k] = 'and ' + keep[k]
  }

  val = keep.join(max) // reuse

  if (opts.suffix !== false) {
    val += del < 0 ? ' ago' : ' from now'
  }

  return val
}

export default relativeDate
