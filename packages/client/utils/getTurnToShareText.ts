import {DONE} from './constants'
import isNewSince from './isNewSince'
import isPastDue from './isPastDue'
import {shortMonths} from './makeDateString'

interface ReviewTask {
  readonly status: string
  readonly createdAt: string
  readonly dueDate?: string | null
}

const formatShortDate = (date: string) => {
  const parsed = new Date(date)
  return `${shortMonths[parsed.getMonth()]} ${parsed.getDate()}`
}

const getTurnToShareText = (
  tasks: readonly ReviewTask[],
  lastRetroEndedAt: string | null | undefined,
  now = Date.now()
) => {
  const openTasks = tasks.filter((task) => task.status !== DONE)
  const newCount = openTasks.filter((task) => isNewSince(task.createdAt, lastRetroEndedAt)).length
  const pastDueCount = openTasks.filter((task) => isPastDue(task.dueDate, now)).length
  const worthRaising = [
    newCount > 0 && lastRetroEndedAt
      ? `${newCount} new since ${formatShortDate(lastRetroEndedAt)}`
      : '',
    pastDueCount > 0 ? `${pastDueCount} past due` : ''
  ].filter(Boolean)
  if (worthRaising.length === 0) return 'Your turn to share! Quick updates only, please.'
  return `Your turn to share! ${openTasks.length} open: ${worthRaising.join(', ')}.`
}

export default getTurnToShareText
