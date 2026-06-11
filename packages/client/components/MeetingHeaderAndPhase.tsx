import type {ReactNode} from 'react'
import {cn} from '../ui/cn'

interface Props {
  children: ReactNode
  hideBottomBar: boolean
}

const MeetingHeaderAndPhase = ({children, hideBottomBar}: Props) => {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 min-w-0 flex-1 flex-col single-reflection-column:pb-0',
        !hideBottomBar && 'pb-14'
      )}
    >
      {children}
    </div>
  )
}

export default MeetingHeaderAndPhase
