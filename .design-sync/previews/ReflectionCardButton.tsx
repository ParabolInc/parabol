import {ReflectionCardButton} from 'parabol-client'

export const States = () => (
  <div className='flex items-center gap-4'>
    <ReflectionCardButton aria-label='Card options'>⋯</ReflectionCardButton>
    <ReflectionCardButton disabled aria-label='Card options'>
      ⋯
    </ReflectionCardButton>
  </div>
)
