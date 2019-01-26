// mostly copied from https://github.com/lukeed/fromnow/blob/master/src/index.js
// added `now` option
// capitalized J in just now
// set my own defaults

const MIN = 60 * 1e3
const HOUR = MIN * 60
const DAY = HOUR * 24
const YEAR = DAY * 365
const MONTH = DAY * 30

interface Opts {
  max?: number
  zero?: boolean
  and?: boolean
  suffix?: boolean
  now?: string | Date
}

const relativeDate = (date: string | Date, opts: Opts = {max: 1, suffix: true}) => {
  const now = opts.now ? new Date(opts.now) : new Date()
  const del = new Date(date).getTime() - now.getTime()
  const abs = Math.abs(del)

  if (abs < MIN) return 'Just now'

  const periods = {
    year: abs / YEAR,
    month: (abs % YEAR) / MONTH,
    day: (abs % MONTH) / DAY,
    hour: (abs % DAY) / HOUR,
    minute: (abs % HOUR) / MIN
  }

  let k
  let val
  const keep: Array<string> = []
  let max: number | string = opts.max || YEAR // large number

  for (k in periods) {
    if (keep.length < max) {
      val = Math.floor(periods[k])
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

  if (opts.suffix) {
    val += del < 0 ? ' ago' : ' from now'
  }

  return val
}

export default relativeDate
