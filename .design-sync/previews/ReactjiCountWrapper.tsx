import {ReactjiCountWrapper} from 'parabol-client'

// FLOOR CARD: ReactjiCountWrapper renders <ReactjiCount reactjiRef={...}> which
// requires a live Relay fragment ($key) that cannot be fabricated statically.
export const FloorCard = () => {
  void ReactjiCountWrapper
  return (
    <div className='rounded-lg bg-slate-100 p-4 text-slate-600 text-sm'>
      Requires live Relay reactji data (reactjiRef fragment)
    </div>
  )
}
