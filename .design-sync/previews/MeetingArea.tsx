import {MeetingArea} from 'parabol-client'

export const Default = () => (
  <MeetingArea>
    <div className='h-40 w-40 rounded-l-lg bg-slate-200 p-4 text-slate-700 text-sm'>
      Phase sidebar
    </div>
    <div className='h-40 flex-1 rounded-r-lg bg-slate-100 p-4 text-slate-700 text-sm'>
      Reflect phase content
    </div>
  </MeetingArea>
)
