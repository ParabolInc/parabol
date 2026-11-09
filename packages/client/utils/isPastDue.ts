import ms from 'ms'

const isPastDue = (dueDate: string | null | undefined, now = Date.now()) => {
  if (!dueDate) return false
  return Math.ceil((new Date(dueDate).getTime() - now) / ms('1d')) <= 0
}

export default isPastDue
