import dayjs from 'dayjs'

interface RankedIssue {
  updatedAt?: string | null
  importance?: number | null
}

export interface IssueDay<T> {
  key: string
  label: string
  issues: T[]
}

const toTime = ({updatedAt}: RankedIssue) => (updatedAt ? new Date(updatedAt).getTime() : 0)

const compareMostNotable = (a: RankedIssue, b: RankedIssue) =>
  (b.importance ?? 0) - (a.importance ?? 0) || toTime(b) - toTime(a)

// Newest day first. Within a day, the most notable lead
const groupIssuesByDay = <T extends RankedIssue>(issues: readonly T[]): IssueDay<T>[] => {
  const issuesByDay = new Map<string, T[]>()
  const undated: T[] = []
  issues.forEach((issue) => {
    if (!issue.updatedAt) {
      undated.push(issue)
      return
    }
    const key = dayjs(issue.updatedAt).format('YYYY-MM-DD')
    const dayIssues = issuesByDay.get(key)
    if (dayIssues) dayIssues.push(issue)
    else issuesByDay.set(key, [issue])
  })
  const thisYear = dayjs().year()
  const days = [...issuesByDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, dayIssues]) => {
      const day = dayjs(key)
      return {
        key,
        label: day.format(day.year() === thisYear ? 'ddd, MMM D' : 'ddd, MMM D, YYYY'),
        issues: dayIssues.sort(compareMostNotable)
      }
    })
  return undated.length > 0
    ? [...days, {key: 'undated', label: 'Undated', issues: undated.sort(compareMostNotable)}]
    : days
}

export default groupIssuesByDay
