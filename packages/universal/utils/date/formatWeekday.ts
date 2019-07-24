import {days, shortMonths} from '../makeDateString'

const formatWeekday = (ts: Date) => {
  const month = ts.getMonth()
  const date = ts.getDate()
  const monthStr = shortMonths[month]
  const weekDay = days[ts.getDay()]
  return `${weekDay}, ${monthStr} ${date}`
}

export default formatWeekday
