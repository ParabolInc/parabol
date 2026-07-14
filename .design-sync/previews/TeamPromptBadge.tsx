import {TeamPromptBadge} from 'parabol-client'

export const Active = () => (
  <div className='rounded-2xl bg-slate-700 p-6'>
    <TeamPromptBadge>Active</TeamPromptBadge>
  </div>
)

export const Responses = () => (
  <div className='flex gap-3 rounded-2xl bg-slate-700 p-6'>
    <TeamPromptBadge>3 of 5 responded</TeamPromptBadge>
    <TeamPromptBadge>All responded</TeamPromptBadge>
  </div>
)
