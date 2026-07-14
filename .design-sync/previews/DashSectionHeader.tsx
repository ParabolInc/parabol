import {DashSectionHeader} from 'parabol-client'

export const Default = () => (
  <DashSectionHeader>
    <h1 className='m-0 font-semibold text-slate-700 text-xl'>Meetings</h1>
  </DashSectionHeader>
)

export const WithSubtitle = () => (
  <DashSectionHeader>
    <h1 className='m-0 font-semibold text-slate-700 text-xl'>Tasks</h1>
    <div className='text-slate-600 text-sm'>Across all of your teams</div>
  </DashSectionHeader>
)
