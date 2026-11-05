import {type ReactNode, useState} from 'react'
import ReportDrawerSlotContext from './ReportDrawerSlotContext'

interface Props {
  children: ReactNode
}

const ReportDrawerLayout = ({children}: Props) => {
  const [drawerSlot, setDrawerSlot] = useState<HTMLDivElement | null>(null)
  return (
    <ReportDrawerSlotContext.Provider value={drawerSlot}>
      <div className='flex min-h-0 flex-1'>
        <div className='min-w-0 flex-1 overflow-y-auto overscroll-none'>{children}</div>
        <div ref={setDrawerSlot} className='flex shrink-0' />
      </div>
    </ReportDrawerSlotContext.Provider>
  )
}

export default ReportDrawerLayout
