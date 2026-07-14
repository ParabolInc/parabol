import {ReflectWrapperMobile} from 'parabol-client'
import {useState} from 'react'

const Slide = ({title}: {title: string}) => (
  <div className='rounded-lg bg-slate-100 p-3'>
    <div className='mb-2 font-semibold text-slate-700 text-sm'>{title}</div>
    <div className='rounded bg-white p-2 text-slate-700 text-sm shadow'>Reflection card</div>
  </div>
)

export const Swipeable = () => {
  const [idx, setIdx] = useState(0)
  return (
    <div className='h-56 w-64 bg-white'>
      <ReflectWrapperMobile activeIdx={idx} setActiveIdx={setIdx} focusedIdx={1}>
        <Slide title='What went well?' />
        <Slide title='What needs work?' />
        <Slide title='Action items' />
      </ReflectWrapperMobile>
    </div>
  )
}
