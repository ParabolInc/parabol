import ensureDate from './ensureDate'

const thresholds = {
  second: 1000,
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2592000000,
  year: 31536000000,
  inf: Infinity
}
// For 2m20s returns 40s, for 4h15m returns 45m etc.
export default function getRefreshPeriod(maybeTime: unknown) {
  const time = ensureDate(maybeTime)
  const msElapsed = Date.now() - time.getTime() || 0
  const threshKeys = Object.keys(thresholds) as (keyof typeof thresholds)[]
  for (let i = 1; i < threshKeys.length; i++) {
    const thresh = thresholds[threshKeys[i]!]
    if (msElapsed < thresh) {
      const largestUnit = thresholds[threshKeys[i - 1]!]
      const timeToNext = largestUnit - (msElapsed % largestUnit)
      return msElapsed > thresholds.minute ? timeToNext : thresholds.minute
    }
  }
  throw new Error('Infinite timestamp calculated!')
}
