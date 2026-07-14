import type {ReactNode} from 'react'
import {MiniPokerCard, PokerVotingRowBase} from 'parabol-client'

const Avatar = ({initials, color}: {initials: string; color: string}) => (
  <div
    className={`flex h-9 w-9 items-center justify-center rounded-full ${color} font-semibold text-sm text-white`}
  >
    {initials}
  </div>
)

const Row = ({avatar, children}: {avatar: ReactNode; children: ReactNode}) => (
  <PokerVotingRowBase>
    {avatar}
    <div className='ml-3 flex gap-1'>{children}</div>
  </PokerVotingRowBase>
)

export const SingleVote = () => (
  <div className='w-80 rounded bg-white'>
    <Row avatar={<Avatar initials='JL' color='bg-sky-500' />}>
      <MiniPokerCard color='#4C9EE7'>5</MiniPokerCard>
    </Row>
  </div>
)

export const MultipleVoters = () => (
  <div className='w-80 rounded bg-white'>
    <Row avatar={<Avatar initials='JL' color='bg-sky-500' />}>
      <MiniPokerCard color='#4C9EE7'>5</MiniPokerCard>
    </Row>
    <Row avatar={<Avatar initials='MP' color='bg-grape-500' />}>
      <MiniPokerCard color='#7C6BD6'>3</MiniPokerCard>
    </Row>
    <Row avatar={<Avatar initials='RK' color='bg-jade-500' />}>
      <MiniPokerCard color='#5CB88B'>8</MiniPokerCard>
    </Row>
  </div>
)

export const NoVoteYet = () => (
  <div className='w-80 rounded bg-white'>
    <Row avatar={<Avatar initials='TA' color='bg-tomato-500' />}>
      <MiniPokerCard>?</MiniPokerCard>
    </Row>
  </div>
)
