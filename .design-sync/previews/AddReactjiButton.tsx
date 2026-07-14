import {AddReactjiButton} from 'parabol-client'

export const Default = () => (
  <div className='flex items-center gap-3 rounded-lg bg-white p-4 text-slate-700 text-sm shadow'>
    <span>Great pairing session this week</span>
    <AddReactjiButton onToggle={() => {}} />
  </div>
)

export const Row = () => (
  <div className='flex items-center gap-4 rounded-lg bg-slate-100 p-4'>
    <AddReactjiButton onToggle={() => {}} />
    <AddReactjiButton onToggle={() => {}} />
    <AddReactjiButton onToggle={() => {}} />
  </div>
)
