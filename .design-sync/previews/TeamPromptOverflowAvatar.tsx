import {TeamPromptOverflowAvatar} from 'parabol-client'

export const Overflow = () => (
  <div className='relative h-9 w-9'>
    <TeamPromptOverflowAvatar offset={0} overflowCount={3} width={36} />
  </div>
)

export const ManyResponders = () => (
  <div className='relative h-9 w-9'>
    <TeamPromptOverflowAvatar offset={0} overflowCount={99} width={36} />
  </div>
)
