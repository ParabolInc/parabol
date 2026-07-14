import {ReflectWrapperDesktop} from 'parabol-client'

const Column = ({title}: {title: string}) => (
  <div className='m-2 w-48 rounded-lg bg-slate-100 p-3'>
    <div className='mb-2 font-semibold text-slate-700 text-sm'>{title}</div>
    <div className='mb-2 rounded bg-white p-2 text-slate-700 text-sm shadow'>Reflection card</div>
    <div className='rounded bg-white p-2 text-slate-700 text-sm shadow'>Another reflection</div>
  </div>
)

export const Columns = () => (
  <div className='h-60 w-full bg-white'>
    <ReflectWrapperDesktop>
      <Column title='What went well?' />
      <Column title='What needs work?' />
      <Column title='Action items' />
    </ReflectWrapperDesktop>
  </div>
)
