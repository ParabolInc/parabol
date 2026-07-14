import {EstimateDimensionColumn} from 'parabol-client'

// Identity Relay stub: a single `stage` object satisfies every child fragment
// that renders (DeckActivityAvatars_stage, PokerActiveVoting_stage), and a
// single `meeting` object satisfies PokerActiveVoting_meeting.
const avatar = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46'%3E%3Crect width='46' height='46' fill='hsl(${hue},60%25,55%25)'/%3E%3C/svg%3E`

const score = (i: number, name: string, hue: number) => ({
  userId: `u${i}`,
  user: {id: `u${i}`, picture: avatar(hue), preferredName: name}
})

const meeting = {
  facilitatorUserId: 'facilitator1',
  id: 'meeting1',
  endedAt: null,
  viewerMeetingMember: {isSpectating: false},
  meetingMembers: [
    {id: 'mm1', isSpectating: false},
    {id: 'mm2', isSpectating: false},
    {id: 'mm3', isSpectating: false}
  ],
  team: {orgId: 'org1'}
}

const stage = {
  id: 'stage1',
  isVoting: true,
  dimensionRef: {name: 'Effort'},
  hoveringUsers: [],
  scores: [score(1, 'Jordan Husney', 10), score(2, 'Aki Tanaka', 150), score(3, 'Mel Rivera', 265)]
}

export const VotingColumn = () => (
  <div className='h-72 w-96 rounded-card bg-white shadow-card'>
    <EstimateDimensionColumn meeting={meeting} stage={stage} />
  </div>
)
