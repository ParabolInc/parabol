import {PhaseHeaderTitle} from 'parabol-client'

export const Default = () => <PhaseHeaderTitle>Reflect</PhaseHeaderTitle>

export const Phases = () => (
  <div className='flex flex-col gap-2'>
    <PhaseHeaderTitle>Reflect</PhaseHeaderTitle>
    <PhaseHeaderTitle>Group</PhaseHeaderTitle>
    <PhaseHeaderTitle>Vote</PhaseHeaderTitle>
    <PhaseHeaderTitle>Discuss</PhaseHeaderTitle>
  </div>
)
