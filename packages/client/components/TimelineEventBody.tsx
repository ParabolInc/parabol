import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const TimelineEventBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <div ref={ref} className={cn('px-4 pb-4 text-sm min-[600px]:pl-14', className)} {...rest}>
        {children}
      </div>
    )
  }
)

export default TimelineEventBody
