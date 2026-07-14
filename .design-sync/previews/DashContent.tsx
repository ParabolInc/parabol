import {DashContent, DashSectionHeader} from 'parabol-client'

const Card = ({title, meta}: {title: string; meta: string}) => (
  <div className='rounded-md bg-white p-3 shadow-card'>
    <div className='font-semibold text-slate-700 text-sm'>{title}</div>
    <div className='text-slate-600 text-xs'>{meta}</div>
  </div>
)

export const Default = () => (
  <div className='w-full overflow-hidden rounded-md border border-slate-300' style={{height: 260}}>
    <DashContent>
      <DashSectionHeader>
        <h1 className='m-0 font-semibold text-slate-700 text-xl'>Team Tasks</h1>
      </DashSectionHeader>
      <div className='grid grid-cols-2 gap-3 px-5 pb-4'>
        <Card title='Ship retro timeline' meta='Engineering · Due Fri' />
        <Card title='Draft Q3 OKRs' meta='Leadership · In progress' />
        <Card title='Review onboarding' meta='Design · Backlog' />
        <Card title='Sprint Poker setup' meta='Product · Todo' />
      </div>
    </DashContent>
  </div>
)
