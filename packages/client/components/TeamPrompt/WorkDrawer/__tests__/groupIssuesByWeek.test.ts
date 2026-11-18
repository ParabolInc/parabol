import dayjs from 'dayjs'
import groupIssuesByWeek from '../groupIssuesByWeek'

const local = (time: string) => dayjs(time).toISOString()
const issue = (time: string | null) => ({updatedAt: time && local(time)})

describe('groupIssuesByWeek', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(local('2026-11-17T12:00')))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('groups newest first into Monday-to-Sunday weeks clipped to the window', () => {
    const weeks = groupIssuesByWeek(
      [
        issue('2026-10-29T10:00'),
        issue('2026-11-13T10:00'),
        issue(null),
        issue('2026-11-17T09:00'),
        issue('2026-11-06T10:00'),
        issue('2026-11-01T10:00'),
        issue('2026-11-16T10:00'),
        issue('2026-11-10T10:00')
      ],
      local('2026-10-28T09:00'),
      dayjs(local('2026-11-17T00:00')).endOf('day').toISOString()
    )
    expect(
      weeks.map(({label, issues}) => [
        label,
        issues.map(({updatedAt}) => (updatedAt ? dayjs(updatedAt).format('MMM D') : null))
      ])
    ).toEqual([
      ['Nov 16 – 17', ['Nov 17', 'Nov 16']],
      ['Nov 9 – 15', ['Nov 13', 'Nov 10']],
      ['Nov 2 – 8', ['Nov 6']],
      ['Oct 28 – Nov 1', ['Nov 1', 'Oct 29']],
      ['Undated', [null]]
    ])
  })

  it('shows a one-day window once', () => {
    const weeks = groupIssuesByWeek(
      [issue('2026-11-17T10:00')],
      local('2026-11-17T09:00'),
      dayjs(local('2026-11-17T00:00')).endOf('day').toISOString()
    )
    expect(weeks.map(({label}) => label)).toEqual(['Nov 17'])
  })
})
