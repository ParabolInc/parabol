import {DAY, MONTH} from './relativeDate'

// Lower number = newer = should appear first
const LABEL_SORT_ORDER = {
  '🌅 Today': 0,
  '🌙 Yesterday': 1,
  '📅 This week': 2,
  '📆 This month': 3,
  '🗓️ Past 3 months': 4,
  '📚 Past 6 months': 5,
  '🏛️ Ancient history': 6
} as const

export type TimelineLabel = keyof typeof LABEL_SORT_ORDER

export const compareTimelineLabels = (a: TimelineLabel, b: TimelineLabel) => {
  return LABEL_SORT_ORDER[a] - LABEL_SORT_ORDER[b]
}

interface TimelineGroup {
  events: any[]
  label: TimelineLabel
}

const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const getTimeGroup = (date: Date): TimelineLabel => {
  const now = new Date()
  const today = getStartOfDay(now)
  const yesterday = new Date(today.getTime() - DAY)
  const lastWeek = new Date(today.getTime() - 7 * DAY)
  const lastMonth = new Date(today.getTime() - 30 * DAY)
  const last3Months = new Date(today.getTime() - 3 * MONTH)
  const last6Months = new Date(today.getTime() - 6 * MONTH)

  const compareDate = getStartOfDay(date)

  if (compareDate >= today) {
    return '🌅 Today'
  } else if (compareDate >= yesterday) {
    return '🌙 Yesterday'
  } else if (compareDate >= lastWeek) {
    return '📅 This week'
  } else if (compareDate >= lastMonth) {
    return '📆 This month'
  } else if (compareDate >= last3Months) {
    return '🗓️ Past 3 months'
  } else if (compareDate >= last6Months) {
    return '📚 Past 6 months'
  }
  return '🏛️ Ancient history'
}

export type {TimelineGroup}
