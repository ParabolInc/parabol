import dayjs from 'dayjs'

// the month 2 months back, last month, and this month so far, which a sample report runs month by month over
export const SAMPLE_MONTHS = [2, 1, 0].map((monthsAgo) => {
  const start = dayjs().startOf('month').subtract(monthsAgo, 'month')
  return {value: start.toISOString(), label: start.format('YYYY-MM-DD'), isPartial: monthsAgo === 0}
})
