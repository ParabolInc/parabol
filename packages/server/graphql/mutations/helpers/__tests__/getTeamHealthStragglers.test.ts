import getTeamHealthStragglers from '../getTeamHealthStragglers'

const teamMembers = [{userId: 'ann'}, {userId: 'bob'}, {userId: 'cat'}, {userId: 'dan'}]
const questionIds = [1, 2]

describe('getTeamHealthStragglers', () => {
  it('nudges everyone eligible when nobody has answered', () => {
    const result = getTeamHealthStragglers({
      teamMembers,
      meetingMembers: [],
      inactiveUserIds: new Set(),
      responses: [],
      questionIds
    })
    expect(result.eligibleUserIds).toEqual(['ann', 'bob', 'cat', 'dan'])
    expect(result.stragglerUserIds).toEqual(['ann', 'bob', 'cat', 'dan'])
    expect(result.respondentCount).toBe(0)
  })

  it('excludes spectators and inactive users from eligibility', () => {
    const result = getTeamHealthStragglers({
      teamMembers,
      meetingMembers: [
        {userId: 'ann', isSpectating: true},
        {userId: 'bob', isSpectating: false}
      ],
      inactiveUserIds: new Set(['dan']),
      responses: [],
      questionIds
    })
    expect(result.eligibleUserIds).toEqual(['bob', 'cat'])
    expect(result.stragglerUserIds).toEqual(['bob', 'cat'])
  })

  it('treats partial responders as stragglers but counts them as respondents', () => {
    const result = getTeamHealthStragglers({
      teamMembers,
      meetingMembers: [],
      inactiveUserIds: new Set(),
      responses: [
        {userId: 'ann', questionId: 1},
        {userId: 'ann', questionId: 2},
        {userId: 'bob', questionId: 1}
      ],
      questionIds
    })
    expect(result.stragglerUserIds).toEqual(['bob', 'cat', 'dan'])
    expect(result.respondentCount).toBe(2)
  })

  it('returns no stragglers when every eligible member is complete', () => {
    const result = getTeamHealthStragglers({
      teamMembers: [{userId: 'ann'}, {userId: 'bob'}],
      meetingMembers: [{userId: 'bob', isSpectating: true}],
      inactiveUserIds: new Set(),
      responses: [
        {userId: 'ann', questionId: 1},
        {userId: 'ann', questionId: 2}
      ],
      questionIds
    })
    expect(result.eligibleUserIds).toEqual(['ann'])
    expect(result.stragglerUserIds).toEqual([])
    expect(result.respondentCount).toBe(1)
  })

  it('ignores responses from people who are no longer eligible', () => {
    const result = getTeamHealthStragglers({
      teamMembers: [{userId: 'ann'}],
      meetingMembers: [],
      inactiveUserIds: new Set(),
      responses: [{userId: 'gone', questionId: 1}],
      questionIds
    })
    expect(result.respondentCount).toBe(0)
    expect(result.stragglerUserIds).toEqual(['ann'])
  })
})
