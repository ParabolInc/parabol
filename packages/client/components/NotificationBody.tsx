import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const NotificationBody = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div {...rest} ref={ref} className={cn('flex flex-1 flex-col py-2', className)}>
        {children}
      </div>
    )
  }
)

export default NotificationBody
