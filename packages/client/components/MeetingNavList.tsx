import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const MeetingNavList = forwardRef<HTMLUListElement, ComponentPropsWithoutRef<'ul'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <ul
        ref={ref}
        className={cn(
          'm-0 flex min-h-0 flex-1 list-none flex-col overflow-auto px-3 py-0',
          className
        )}
        {...rest}
      >
        {children}
      </ul>
    )
  }
)

export default MeetingNavList
