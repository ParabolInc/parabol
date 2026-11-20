import dayjs from 'dayjs'
import groupIssuesByDay from '../groupIssuesByDay'

const local = (time: string) => dayjs(time).toISOString()
const issue = (title: string, time: string | null, importance = 0) => ({
  title,
  updatedAt: time && local(time),
  importance
})

describe('groupIssuesByDay', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(local('2026-11-18T12:00')))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('groups newest day first, each day led by the most notable, then the newest', () => {
    const days = groupIssuesByDay([
      issue('routine', '2026-11-18T16:00', 1),
      issue('undated', null),
      issue('notable', '2026-11-18T09:00', 5),
      issue('middling', '2026-11-18T08:00', 2),
      issue('also routine', '2026-11-18T10:00', 1),
      issue('last year', '2025-12-31T10:00', 3),
      issue('yesterday', '2026-11-17T10:00', 0)
    ])
    expect(days.map(({label, issues}) => [label, issues.map(({title}) => title)])).toEqual([
      ['Wed, Nov 18', ['notable', 'middling', 'routine', 'also routine']],
      ['Tue, Nov 17', ['yesterday']],
      ['Wed, Dec 31, 2025', ['last year']],
      ['Undated', ['undated']]
    ])
  })
})
