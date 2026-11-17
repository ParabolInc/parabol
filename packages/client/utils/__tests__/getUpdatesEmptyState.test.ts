import getUpdatesEmptyState from '../getUpdatesEmptyState'

const makeTask = (status = 'active', tags: string[] = []) => ({status, tags})

describe('getUpdatesEmptyState', () => {
  it('shows nothing when the person has cards', () => {
    expect(getUpdatesEmptyState([makeTask()], 1, 'Lena', false)).toBeNull()
  })

  it('calls it a clean slate when nobody has an open task', () => {
    const tasks = [
      makeTask('done'),
      makeTask('active', ['private']),
      makeTask('stuck', ['archived'])
    ]
    expect(getUpdatesEmptyState(tasks, 0, 'Lena', false)).toEqual({
      title: 'A clean slate',
      description: 'Nobody on the team has an open task. Press Next to move on.'
    })
    expect(getUpdatesEmptyState([], 0, 'Priya', true)?.description).toBe(
      'Nobody on the team has an open task. Press Next to move on, or add a card with +.'
    )
  })

  it('names the person when only they have nothing', () => {
    expect(getUpdatesEmptyState([makeTask('future')], 0, 'Lena', false)).toEqual({
      title: 'Lena has no tasks to review',
      description: 'Press Next to move on.'
    })
  })

  it('offers + only on the viewer’s own stage', () => {
    expect(getUpdatesEmptyState([makeTask()], 0, 'Priya', true)).toEqual({
      title: 'You have no tasks to review',
      description: 'Press Next to move on, or add a card with +.'
    })
  })

  it('falls back when the name is missing', () => {
    expect(getUpdatesEmptyState([makeTask()], 0, null, false)?.title).toBe('No tasks to review')
  })
})
