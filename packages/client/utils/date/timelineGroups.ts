import {DAY, MONTH} from './relativeDate'

interface TimelineGroup {
  date: Date
  events: any[]
  label: string
}

export interface TimelineGrouping {
  date: Date
  label: string
}

const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const getTimeGroup = (date: Date): TimelineGrouping => {
  const now = new Date()
  const today = getStartOfDay(now)
  const yesterday = new Date(today.getTime() - DAY)
  const lastWeek = new Date(today.getTime() - 7 * DAY)
  const lastMonth = new Date(today.getTime() - 30 * DAY)
  const last3Months = new Date(today.getTime() - 3 * MONTH)
  const last6Months = new Date(today.getTime() - 6 * MONTH)

  const compareDate = getStartOfDay(date)

  if (compareDate >= today) {
    return {date: today, label: '🌅 Today'}
  } else if (compareDate >= yesterday) {
    return {date: yesterday, label: '🌙 Yesterday'}
  } else if (compareDate >= lastWeek) {
    return {date: lastWeek, label: '📅 This week'}
  } else if (compareDate >= lastMonth) {
    return {date: lastMonth, label: '📆 This month'}
  } else if (compareDate >= last3Months) {
    return {date: last3Months, label: '🗓️ Past 3 months'}
  } else if (compareDate >= last6Months) {
    return {date: last6Months, label: '📚 Past 6 months'}
  }
  return {date: last6Months, label: '🏛️ Ancient history'}
}

export type {TimelineGroup}
