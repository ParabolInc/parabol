import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

const TimelineEventTitle = forwardRef(
  (props: ComponentPropsWithoutRef<'span'>, ref: Ref<HTMLSpanElement>) => {
    const {className, ...rest} = props
    return (
      <span
        ref={ref}
        className={cn('font-semibold text-fg-primary text-sm', className)}
        {...rest}
      />
    )
  }
)

export default TimelineEventTitle
