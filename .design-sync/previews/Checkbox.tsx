import {Checkbox} from 'parabol-client'

export const States = () => (
  <div className='flex items-center gap-6'>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <Checkbox checked={false} />
      Unchecked
    </label>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <Checkbox checked={true} />
      Checked
    </label>
    <label className='flex items-center gap-2 text-slate-700 text-sm'>
      <Checkbox checked='indeterminate' />
      Indeterminate
    </label>
    <label className='flex items-center gap-2 text-slate-400 text-sm'>
      <Checkbox checked={true} disabled />
      Disabled
    </label>
  </div>
)
