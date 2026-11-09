import getLongOpenMonths from '../getLongOpenMonths'
import getTurnToShareText from '../getTurnToShareText'
import isPastDue from '../isPastDue'

const NOW = new Date('2026-11-09T12:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000
const daysFromNow = (days: number) => new Date(NOW + days * DAY).toISOString()

describe('getLongOpenMonths', () => {
  it('is null under 6 months', () => {
    expect(getLongOpenMonths(daysFromNow(-179), NOW)).toBeNull()
  })
  it('counts whole months from 6 months on', () => {
    expect(getLongOpenMonths(daysFromNow(-180), NOW)).toBe(6)
    expect(getLongOpenMonths(daysFromNow(-425), NOW)).toBe(14)
  })
})

describe('isPastDue', () => {
  it('is false without a due date', () => {
    expect(isPastDue(null, NOW)).toBe(false)
  })
  it('is true once the date has passed', () => {
    expect(isPastDue(daysFromNow(-2), NOW)).toBe(true)
  })
  it('is false for a future date', () => {
    expect(isPastDue(daysFromNow(2), NOW)).toBe(false)
  })
})

describe('getTurnToShareText', () => {
  const FALLBACK = 'Your turn to share! Quick updates only, please.'
  it('uses the usual line when nothing is past due', () => {
    expect(getTurnToShareText([{status: 'active', dueDate: null}], NOW)).toBe(FALLBACK)
  })
  it('counts open tasks and past due ones', () => {
    const tasks = [
      {status: 'active', dueDate: daysFromNow(-3)},
      {status: 'stuck', dueDate: null},
      {status: 'future', dueDate: daysFromNow(5)}
    ]
    expect(getTurnToShareText(tasks, NOW)).toBe('Your turn to share! 3 open: 1 past due.')
  })
  it('leaves Done tasks out of both counts', () => {
    const tasks = [
      {status: 'done', dueDate: daysFromNow(-3)},
      {status: 'active', dueDate: null}
    ]
    expect(getTurnToShareText(tasks, NOW)).toBe(FALLBACK)
  })
})
