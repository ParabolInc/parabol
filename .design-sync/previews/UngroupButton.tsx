import {UngroupButton} from 'parabol-client'

export const OnCard = () => (
  <div className='relative m-3 h-24 w-44 rounded-lg bg-white p-3 text-slate-700 text-sm shadow'>
    3 reflections grouped
    <UngroupButton showUngroupButton />
  </div>
)
