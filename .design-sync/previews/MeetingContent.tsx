import {MeetingContent} from 'parabol-client'

export const Default = () => (
  <div className='h-40 w-full overflow-hidden rounded-lg shadow'>
    <MeetingContent>
      <div className='h-full w-44 bg-slate-200 p-4 text-slate-700 text-sm'>Phase list</div>
      <div className='h-full flex-1 bg-slate-100 p-4 text-slate-700 text-sm'>
        Reflection columns render here
      </div>
    </MeetingContent>
  </div>
)
