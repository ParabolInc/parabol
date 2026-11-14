import sortSummaryMembers from '../sortSummaryMembers'

const member = (userId: string, preferredName: string) => ({userId, user: {preferredName}})

describe('sortSummaryMembers', () => {
  it('puts the viewer first, then everyone else by name', () => {
    const sorted = sortSummaryMembers(
      [member('u1', 'Zoe'), member('u2', 'ben'), member('viewer', 'Mia'), member('u3', 'Ava')],
      'viewer'
    )
    expect(sorted.map(({user}) => user.preferredName)).toEqual(['Mia', 'Ava', 'ben', 'Zoe'])
  })

  it('sorts by name when the viewer was not in the meeting', () => {
    const sorted = sortSummaryMembers([member('u1', 'Zoe'), member('u2', 'Ava')], 'viewer')
    expect(sorted.map(({userId}) => userId)).toEqual(['u2', 'u1'])
  })
})
