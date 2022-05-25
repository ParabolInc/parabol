import formatTime from './formatTime'
import formatWeekday from './formatWeekday'

function absoluteDate(date: string | Date) {
  const datetime = new Date(date)
  const fallbackDate = formatWeekday(datetime)
  const fallbackTime = formatTime(datetime)
  return fallbackDate + ' at ' + fallbackTime
}

export default absoluteDate
