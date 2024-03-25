import ensureDate from './ensureDate'

export default function makeMonthDateString(datetime: Date | string | null) {
  const timestamp = ensureDate(datetime)
  return timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
