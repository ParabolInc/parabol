import ms from 'ms'

// fromNow is true for the current streak, else falsy for max streak within series
const getMonthlyStreak = (descendingTimestamps: number[], fromNow?: boolean) => {
  const firstTimestamp = descendingTimestamps[0]
  if (!firstTimestamp) return 0
  const start = fromNow ? Date.now() : firstTimestamp
  const dates = descendingTimestamps.slice(fromNow ? 1 : 0)
  const DAYS_PER_MONTH = 365.25 / 12
  const msPerMonth = DAYS_PER_MONTH * ms('1d')
  let lowThresh = start - msPerMonth
  let curStreak = 1
  let maxStreak = 1
  let minDate = start
  let streakHit = false
  for (let i = 0; i < dates.length; i++) {
    const nextDate = dates[i]!
    if (nextDate >= lowThresh) {
      minDate = nextDate
      streakHit = true
      continue
    }
    if (streakHit) {
      curStreak++
      maxStreak = Math.max(maxStreak, curStreak)
      lowThresh = minDate - msPerMonth
      i--
    } else if (fromNow) {
      break
    } else {
      curStreak = 1
      lowThresh = nextDate - msPerMonth
    }
    streakHit = false
  }
  return maxStreak
}

export default getMonthlyStreak
