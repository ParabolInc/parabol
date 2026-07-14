import {PhaseItemChits} from 'parabol-client'

export const Submitted = () => (
  <div className='w-80 rounded-lg bg-slate-100 p-4'>
    <PhaseItemChits count={6} editorCount={0} />
  </div>
)

export const InProgress = () => (
  <div className='w-80 rounded-lg bg-slate-100 p-4'>
    <PhaseItemChits count={4} editorCount={3} />
  </div>
)
