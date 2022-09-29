import ensureDate from './ensureDate'
import {months} from './makeDateString'

export default function makeMonthString(datetime: Date | string | null) {
  const timestamp = ensureDate(datetime)
  const month = timestamp.getMonth()
  const year = timestamp.getFullYear()
  return `${months[month]} ${year}`
}
