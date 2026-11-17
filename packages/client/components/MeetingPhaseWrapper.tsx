import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const MeetingPhaseWrapper = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('mx-auto flex h-full w-full justify-around overflow-hidden', className)}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default MeetingPhaseWrapper
