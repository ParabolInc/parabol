import {RadioGroup, RadioGroupItem} from 'parabol-client'

export const VotingPrivacy = () => (
  <RadioGroup defaultValue='anonymous' className='gap-3'>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <RadioGroupItem value='anonymous' />
      Anonymous voting
    </label>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <RadioGroupItem value='named' />
      Show who voted
    </label>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <RadioGroupItem value='facilitator' />
      Facilitator decides later
    </label>
  </RadioGroup>
)

export const Disabled = () => (
  <RadioGroup defaultValue='weekly' className='gap-3'>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <RadioGroupItem value='weekly' />
      Weekly
    </label>
    <label className='flex items-center gap-2 text-slate-400 text-sm'>
      <RadioGroupItem value='daily' disabled />
      Daily (upgrade required)
    </label>
  </RadioGroup>
)
