import {DashSectionControls, DashSectionHeader} from 'parabol-client'

export const Default = () => (
  <div className='w-full bg-slate-200 py-2'>
    <DashSectionControls>
      <DashSectionHeader>
        <h1 className='m-0 font-semibold text-slate-700 text-xl'>Active Meetings</h1>
      </DashSectionHeader>
      <div className='flex shrink-0 items-center gap-3 pr-5'>
        <button className='rounded-full bg-slate-300 px-3 py-1 font-semibold text-slate-700 text-sm'>
          Filter
        </button>
        <button className='rounded-full bg-sky-500 px-3 py-1 font-semibold text-white text-sm'>
          Add Meeting
        </button>
      </div>
    </DashSectionControls>
  </div>
)
