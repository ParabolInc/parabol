import {PokerActiveVoting} from 'parabol-client'

// Identity Relay stub: pass fragment $data objects directly.
const avatar = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46'%3E%3Crect width='46' height='46' fill='hsl(${hue},60%25,55%25)'/%3E%3C/svg%3E`

const score = (i: number, name: string, hue: number) => ({
  userId: `u${i}`,
  user: {id: `u${i}`, picture: avatar(hue), preferredName: name}
})

const meeting = {
  facilitatorUserId: 'facilitator1',
  id: 'meeting1',
  meetingMembers: [
    {id: 'mm1', isSpectating: false},
    {id: 'mm2', isSpectating: false},
    {id: 'mm3', isSpectating: false}
  ],
  team: {orgId: 'org1'}
}

export const VotesIn = () => (
  <div className='w-96 rounded-card bg-white p-2 shadow-card'>
    <PokerActiveVoting
      isClosing={false}
      isInitialStageRender
      meeting={meeting}
      stage={{
        id: 'stage1',
        scores: [score(1, 'Jordan Husney', 10), score(2, 'Aki Tanaka', 150)]
      }}
    />
  </div>
)

export const NoVotesYet = () => (
  <div className='w-96 rounded-card bg-white p-2 shadow-card'>
    <PokerActiveVoting
      isClosing={false}
      isInitialStageRender
      meeting={meeting}
      stage={{id: 'stage2', scores: []}}
    />
  </div>
)
