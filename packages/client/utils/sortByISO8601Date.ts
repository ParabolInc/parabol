const sortByISO8601Date = (dateA: string, dateB: string) =>
  dateA < dateB ? -1 : dateA > dateB ? 1 : 0

export default sortByISO8601Date
