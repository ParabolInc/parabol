import getLongOpenMonths from '../getLongOpenMonths'
import getTurnToShareText from '../getTurnToShareText'
import isNewSince from '../isNewSince'
import isPastDue from '../isPastDue'

const NOW = new Date('2026-11-09T12:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000
const daysFromNow = (days: number) => new Date(NOW + days * DAY).toISOString()
const LAST_RETRO = '2026-10-26T12:00:00Z'

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
    expect(
      getTurnToShareText(
        [{status: 'active', dueDate: null, createdAt: daysFromNow(-40)}],
        null,
        NOW
      )
    ).toBe(FALLBACK)
  })
  it('counts open tasks and past due ones', () => {
    const tasks = [
      {status: 'active', dueDate: daysFromNow(-3), createdAt: daysFromNow(-40)},
      {status: 'stuck', dueDate: null, createdAt: daysFromNow(-40)},
      {status: 'future', dueDate: daysFromNow(5), createdAt: daysFromNow(-40)}
    ]
    expect(getTurnToShareText(tasks, null, NOW)).toBe('Your turn to share! 3 open: 1 past due.')
  })
  it('leaves Done tasks out of both counts', () => {
    const tasks = [
      {status: 'done', dueDate: daysFromNow(-3), createdAt: daysFromNow(-1)},
      {status: 'active', dueDate: null, createdAt: daysFromNow(-40)}
    ]
    expect(getTurnToShareText(tasks, LAST_RETRO, NOW)).toBe(FALLBACK)
  })
  it('counts tasks created since the last retro ended', () => {
    const tasks = [
      {status: 'active', dueDate: null, createdAt: daysFromNow(-3)},
      {status: 'future', dueDate: null, createdAt: daysFromNow(-2)},
      {status: 'stuck', dueDate: daysFromNow(-1), createdAt: daysFromNow(-40)}
    ]
    expect(getTurnToShareText(tasks, LAST_RETRO, NOW)).toBe(
      'Your turn to share! 3 open: 2 new since Oct 26, 1 past due.'
    )
  })
})

describe('isNewSince', () => {
  it('is false when there was no earlier retro', () => {
    expect(isNewSince(daysFromNow(-1), null)).toBe(false)
  })
  it('is true for a task created after the last retro ended', () => {
    expect(isNewSince(daysFromNow(-3), LAST_RETRO)).toBe(true)
  })
  it('is false for a task created before it', () => {
    expect(isNewSince(daysFromNow(-40), LAST_RETRO)).toBe(false)
  })
})
