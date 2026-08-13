import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const NotificationMessage = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div {...rest} ref={ref} className={cn('text-fg-primary text-sm', className)}>
        {children}
      </div>
    )
  }
)

export default NotificationMessage
