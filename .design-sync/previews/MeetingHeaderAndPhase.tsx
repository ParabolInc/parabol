import {MeetingHeaderAndPhase} from 'parabol-client'

export const Default = () => (
  <div className='h-40 w-full overflow-hidden rounded-lg shadow'>
    <MeetingHeaderAndPhase hideBottomBar={false}>
      <div className='bg-slate-200 p-4 font-semibold text-slate-700'>Reflect — top bar</div>
      <div className='h-full flex-1 bg-slate-100 p-4 text-slate-700 text-sm'>Phase area</div>
    </MeetingHeaderAndPhase>
  </div>
)
