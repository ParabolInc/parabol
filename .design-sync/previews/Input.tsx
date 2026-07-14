import {Input} from 'parabol-client'

export const Default = () => (
  <label className='flex w-72 flex-col gap-1'>
    <span className='font-semibold text-slate-700 text-sm'>Team name</span>
    <Input defaultValue='Engineering' />
  </label>
)

export const Placeholder = () => (
  <label className='flex w-72 flex-col gap-1'>
    <span className='font-semibold text-slate-700 text-sm'>Search</span>
    <Input placeholder='Search meetings…' />
  </label>
)

export const Disabled = () => (
  <label className='flex w-72 flex-col gap-1'>
    <span className='font-semibold text-slate-700 text-sm'>Workspace URL</span>
    <Input defaultValue='parabol.co/engineering' disabled />
  </label>
)
