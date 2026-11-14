import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const MeetingContent = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('flex h-full w-full flex-1 flex-row overflow-hidden', className)}
      >
        {children}
      </div>
    )
  }
)

export default MeetingContent
