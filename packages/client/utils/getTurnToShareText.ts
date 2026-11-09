import {DONE} from './constants'
import isPastDue from './isPastDue'

interface ReviewTask {
  readonly status: string
  readonly dueDate?: string | null
}

const getTurnToShareText = (tasks: readonly ReviewTask[], now = Date.now()) => {
  const openTasks = tasks.filter((task) => task.status !== DONE)
  const pastDueCount = openTasks.filter((task) => isPastDue(task.dueDate, now)).length
  if (pastDueCount === 0) return 'Your turn to share! Quick updates only, please.'
  return `Your turn to share! ${openTasks.length} open: ${pastDueCount} past due.`
}

export default getTurnToShareText
