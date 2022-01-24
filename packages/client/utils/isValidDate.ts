const isValidDate = (maybeDate: unknown) => maybeDate instanceof Date && maybeDate.getTime() !== 0

export default isValidDate
