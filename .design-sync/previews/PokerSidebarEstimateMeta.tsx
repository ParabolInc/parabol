import {PokerSidebarEstimateMeta} from 'parabol-client'

export const SingleDimension = () => (
  <div className='flex items-center bg-white p-3 font-semibold text-slate-700'>
    <PokerSidebarEstimateMeta finalScores={['5']} />
    <span className='text-slate-600 text-sm'>Story Points</span>
  </div>
)

export const InProgress = () => (
  <div className='flex items-center bg-white p-3'>
    <PokerSidebarEstimateMeta finalScores={['5', null, '8']} />
    <span className='text-slate-600 text-sm'>2 of 3 estimated</span>
  </div>
)

export const NotStarted = () => (
  <div className='flex items-center bg-white p-3'>
    <PokerSidebarEstimateMeta finalScores={[null, null, null]} />
    <span className='text-slate-600 text-sm'>Not yet estimated</span>
  </div>
)
