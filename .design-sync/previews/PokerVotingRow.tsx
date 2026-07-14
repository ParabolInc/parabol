import {PokerVotingRow} from 'parabol-client'

// Identity Relay stub: scaleValue is {color,label}; scores is a plural fragment
// of EstimateUserScore, each carrying a user (AvatarList_users -> id/picture/name).
const avatar = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46'%3E%3Crect width='46' height='46' fill='hsl(${hue},60%25,55%25)'/%3E%3C/svg%3E`

const user = (i: number, name: string, hue: number) => ({
  user: {id: `u${i}`, picture: avatar(hue), preferredName: name}
})

export const Voted = () => (
  <div className='w-80 rounded-lg bg-white p-3 shadow'>
    <PokerVotingRow
      isInitialStageRender
      scaleValue={{color: '#5CB88B', label: '5'}}
      scores={[user(1, 'Jordan Husney', 10), user(2, 'Aki Tanaka', 150), user(3, 'Mel Rivera', 265)]}
    />
  </div>
)

export const SingleVote = () => (
  <div className='w-80 rounded-lg bg-white p-3 shadow'>
    <PokerVotingRow
      isInitialStageRender
      scaleValue={{color: '#E39A3B', label: '8'}}
      scores={[user(4, 'Sam Cho', 320)]}
    />
  </div>
)

export const NoVotes = () => (
  <div className='w-80 rounded-lg bg-white p-3 shadow'>
    <PokerVotingRow isInitialStageRender scaleValue={{color: '#4C9EE7', label: '3'}} scores={[]} />
  </div>
)
