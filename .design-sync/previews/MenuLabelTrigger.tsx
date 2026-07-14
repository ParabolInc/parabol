import {MenuLabelTrigger} from 'parabol-client'

export const Default = () => (
  <div className='w-56 rounded-md border border-slate-300 shadow-sm'>
    <MenuLabelTrigger>Filter by team</MenuLabelTrigger>
  </div>
)

export const Selected = () => (
  <div className='w-56 rounded-md border border-slate-300 shadow-sm'>
    <MenuLabelTrigger labelClassName='font-semibold text-slate-700'>Engineering</MenuLabelTrigger>
  </div>
)
