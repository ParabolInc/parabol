import toMeetingPartners from '../toMeetingPartners'

const alpha = {
  id: 'alpha',
  teamMembers: [{user: {id: 'viewer'}}, {user: {id: 'ana'}}, {user: {id: 'bo'}}]
}
const beta = {id: 'beta', teamMembers: [{user: {id: 'viewer'}}, {user: {id: 'ana'}}]}

const makeMeeting = (
  teamId: string,
  createdAt: string,
  attendeeIds: string[],
  meetingType: 'retrospective' | 'poker' | 'action' = 'retrospective'
) => ({
  teamId,
  createdAt,
  meetingType,
  meetingMembers: attendeeIds.map((id) => ({user: {id}}))
})

describe('toMeetingPartners', () => {
  it('ignores meetings the viewer was not in', () => {
    const meetings = [makeMeeting('alpha', '2026-11-01T00:00:00.000Z', ['ana', 'bo'])]
    expect(toMeetingPartners('viewer', [alpha], meetings)).toEqual([])
  })

  it('leaves out people no longer on the meeting team', () => {
    const meetings = [makeMeeting('beta', '2026-11-01T00:00:00.000Z', ['viewer', 'ana', 'bo'])]
    expect(toMeetingPartners('viewer', [beta], meetings).map(({userId}) => userId)).toEqual(['ana'])
  })

  it('ignores meetings on teams outside the given teams', () => {
    const meetings = [makeMeeting('elsewhere', '2026-11-01T00:00:00.000Z', ['viewer', 'ana'])]
    expect(toMeetingPartners('viewer', [alpha, beta], meetings)).toEqual([])
  })

  it('keeps one entry per person with their newest meeting', () => {
    const meetings = [
      makeMeeting('alpha', '2026-11-03T00:00:00.000Z', ['viewer', 'ana'], 'poker'),
      makeMeeting('beta', '2026-11-01T00:00:00.000Z', ['viewer', 'ana'], 'retrospective')
    ]
    expect(toMeetingPartners('viewer', [alpha, beta], meetings)).toEqual([
      {userId: 'ana', lastMetAt: '2026-11-03T00:00:00.000Z', meetingType: 'poker'}
    ])
  })

  it('sorts partners newest first and never includes the viewer', () => {
    const meetings = [
      makeMeeting('alpha', '2026-11-01T00:00:00.000Z', ['viewer', 'bo'], 'action'),
      makeMeeting('beta', '2026-11-05T00:00:00.000Z', ['viewer', 'ana'], 'poker')
    ]
    expect(toMeetingPartners('viewer', [alpha, beta], meetings)).toEqual([
      {userId: 'ana', lastMetAt: '2026-11-05T00:00:00.000Z', meetingType: 'poker'},
      {userId: 'bo', lastMetAt: '2026-11-01T00:00:00.000Z', meetingType: 'action'}
    ])
  })
})
