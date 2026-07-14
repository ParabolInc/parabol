import {Chip} from 'parabol-client'

export const Default = () => <Chip label='Design Systems' />

export const Removable = () => <Chip label='Q3 Planning' onDelete={() => {}} />

export const Group = () => (
  <div className='flex flex-wrap gap-2'>
    <Chip label='Roadmap' />
    <Chip label='Retrospective' />
    <Chip label='Sprint Poker' onDelete={() => {}} />
  </div>
)
