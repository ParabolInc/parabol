import {PokerVotingNoVotes} from 'parabol-client'

export const EmptyState = () => (
  <div className='w-80 rounded bg-white py-2'>
    <PokerVotingNoVotes />
  </div>
)

export const InSidebarHeader = () => (
  <div className='w-80 rounded bg-white'>
    <div className='border-slate-300 border-b px-4 py-2 font-semibold text-slate-700 text-sm'>
      Story Points
    </div>
    <PokerVotingNoVotes />
  </div>
)
