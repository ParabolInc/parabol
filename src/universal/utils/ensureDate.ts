import isValidDate from 'universal/utils/isValidDate'

const ensureDate = (maybeDate: unknown) => {
  const date = new Date(maybeDate as string)
  return isValidDate(date) ? date : new Date()
}

export default ensureDate
