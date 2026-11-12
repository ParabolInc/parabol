import getTeamMemberTasks from '../getTeamMemberTasks'

const makeTask = (userId: string | null, tags: string[] = [], status = 'active') => ({
  userId,
  tags,
  status
})

describe('getTeamMemberTasks', () => {
  it('keeps the person’s tasks in every status', () => {
    const tasks = ['done', 'active', 'stuck', 'future'].map((status) =>
      makeTask('priya', [], status)
    )
    expect(getTeamMemberTasks(tasks, 'priya')).toEqual(tasks)
  })

  it('drops tasks that belong to someone else', () => {
    const mine = makeTask('priya')
    expect(getTeamMemberTasks([mine, makeTask('lena')], 'priya')).toEqual([mine])
  })

  it('drops private tasks', () => {
    const open = makeTask('priya')
    expect(getTeamMemberTasks([open, makeTask('priya', ['private'])], 'priya')).toEqual([open])
  })

  it('matches nothing when there is no person', () => {
    expect(getTeamMemberTasks([makeTask(null)], undefined)).toEqual([])
  })
})
