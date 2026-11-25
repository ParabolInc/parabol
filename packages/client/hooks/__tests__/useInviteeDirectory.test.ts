import {toInviteeDirectory} from '../useInviteeDirectory'

const makeUser = (id: string) => ({
  user: {id, preferredName: `Name ${id}`, email: `${id}@acme.co`, picture: `${id}.png`}
})

const viewerRef = {
  id: 'viewer',
  teams: [
    {
      id: 'team1',
      name: 'Alpha',
      orgId: 'org1',
      teamMembers: [
        {isSelf: true, user: {id: 'viewer'}},
        {isSelf: false, user: {id: 'ana'}}
      ]
    },
    {
      id: 'team2',
      name: 'Other',
      orgId: 'org2',
      teamMembers: [{isSelf: false, user: {id: 'bo'}}]
    }
  ]
} as unknown as Parameters<typeof toInviteeDirectory>[0]

const organizationRef = {
  id: 'org1',
  name: 'Acme',
  approvedDomains: ['acme.co'],
  organizationUsers: {edges: [{node: makeUser('viewer')}, {node: makeUser('ana')}]},
  viewerMeetingPartners: [
    {lastMetAt: '2026-11-01T00:00:00.000Z', meetingType: 'retrospective', user: {id: 'ana'}}
  ]
} as unknown as Parameters<typeof toInviteeDirectory>[1]

describe('toInviteeDirectory', () => {
  it('keeps only the viewer teams in the organization and drops the viewer from members', () => {
    const directory = toInviteeDirectory(viewerRef, organizationRef)
    expect(directory.teams).toEqual([{id: 'team1', name: 'Alpha', memberIds: ['ana']}])
    expect(directory.people.map(({id}) => id)).toEqual(['ana'])
  })

  it('maps meeting partners to userId', () => {
    const directory = toInviteeDirectory(viewerRef, organizationRef)
    expect(directory.partners).toEqual([
      {userId: 'ana', lastMetAt: '2026-11-01T00:00:00.000Z', meetingType: 'retrospective'}
    ])
  })
})
