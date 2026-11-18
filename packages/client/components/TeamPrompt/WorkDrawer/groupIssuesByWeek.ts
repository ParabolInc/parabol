import dayjs, {type Dayjs} from 'dayjs'

interface DatedIssue {
  updatedAt?: string | null
}

export interface IssueWeek<T> {
  key: string
  label: string
  issues: T[]
}

const formatSpan = (from: Dayjs, to: Dayjs) => {
  if (from.isSame(to, 'day')) return from.format('MMM D')
  if (from.isSame(to, 'month')) return `${from.format('MMM D')} – ${to.format('D')}`
  return `${from.format('MMM D')} – ${to.format('MMM D')}`
}

// Newest first, in Monday-to-Sunday weeks. A week's label is clipped to the window, so the
// first week starts on the window's first day and the current week ends today.
const groupIssuesByWeek = <T extends DatedIssue>(
  issues: readonly T[],
  windowStartAt: string,
  windowEndAt: string
): IssueWeek<T>[] => {
  const windowStart = dayjs(windowStartAt)
  const windowEnd = dayjs(windowEndAt)
  const lastDay = windowEnd.isBefore(dayjs()) ? windowEnd : dayjs()
  const toTime = ({updatedAt}: T) => (updatedAt ? new Date(updatedAt).getTime() : -Infinity)
  const sorted = [...issues].sort((a, b) => toTime(b) - toTime(a) || 0)
  const weeks = new Map<string, IssueWeek<T>>()
  const undated: T[] = []
  sorted.forEach((issue) => {
    if (!issue.updatedAt) {
      undated.push(issue)
      return
    }
    const day = dayjs(issue.updatedAt)
    const monday = day.subtract((day.day() + 6) % 7, 'day').startOf('day')
    const key = monday.format('YYYY-MM-DD')
    const week = weeks.get(key)
    if (week) {
      week.issues.push(issue)
      return
    }
    const sunday = monday.add(6, 'day')
    const isWindowStartInWeek = windowStart.isAfter(monday) && !windowStart.isAfter(sunday, 'day')
    const isLastDayInWeek = lastDay.isBefore(sunday, 'day') && !lastDay.isBefore(monday)
    const from = isWindowStartInWeek ? windowStart : monday
    const to = isLastDayInWeek ? lastDay : sunday
    weeks.set(key, {key, label: formatSpan(from, to), issues: [issue]})
  })
  const datedWeeks = [...weeks.values()]
  return undated.length > 0
    ? [...datedWeeks, {key: 'undated', label: 'Undated', issues: undated}]
    : datedWeeks
}

export default groupIssuesByWeek
