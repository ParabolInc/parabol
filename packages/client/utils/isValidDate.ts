const isValidDate = (maybeDate: unknown): maybeDate is Date =>
  maybeDate instanceof Date && maybeDate.getTime() !== 0

export default isValidDate
