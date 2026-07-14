import {TeamPromptEndedBadge} from 'parabol-client'

export const Ended = () => (
  <div className='rounded-2xl bg-slate-700 p-6'>
    <TeamPromptEndedBadge />
  </div>
)

export const WithCountdown = () => (
  <div className='rounded-2xl bg-slate-700 p-6'>
    <TeamPromptEndedBadge nextMeetingDate={new Date(Date.now() + 1000 * 60 * 60 * 26)} />
  </div>
)
