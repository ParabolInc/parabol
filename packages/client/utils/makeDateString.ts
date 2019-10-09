import ensureDate from './ensureDate'

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const shortDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const shortMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

interface Options {
  showDay?: boolean
}

export default function makeDateString(
  datetime: Date | string | number | undefined | null,
  options: Options = {}
) {
  const timestamp = ensureDate(datetime)
  const {showDay} = options
  const day = timestamp.getDay()
  const month = timestamp.getMonth()
  const date = timestamp.getDate()
  const year = timestamp.getFullYear()
  const dayPart = showDay ? `${days[day]}, ` : ''
  return `${dayPart}${months[month]} ${date}, ${year}`
}
