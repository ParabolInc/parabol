import type {ReactNode} from 'react'
import {cn} from '../../../../ui/cn'

interface Props {
  children: ReactNode
  className?: string
}

const MeetingCopy = ({children, className}: Props) => {
  return (
    <div
      className={cn(
        'my-6 text-[13px] text-slate-700 vote-phase:text-[15px] leading-normal',
        className
      )}
    >
      {children}
    </div>
  )
}

export default MeetingCopy
