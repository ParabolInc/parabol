import {SubmitReflectionButton} from 'parabol-client'

export const States = () => (
  <div className='flex items-center gap-4'>
    <SubmitReflectionButton />
    <SubmitReflectionButton disabled />
  </div>
)
