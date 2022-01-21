import {months} from './makeDateString'
import ensureDate from './ensureDate'

export default function makeMonthString(datetime: Date | string | null) {
  const timestamp = ensureDate(datetime)
  const month = timestamp.getMonth()
  const year = timestamp.getFullYear()
  return `${months[month]} ${year}`
}
