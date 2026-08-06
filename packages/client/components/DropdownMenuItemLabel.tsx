import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const DropdownMenuItemLabel = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <span
        ref={ref}
        className={cn('flex w-full items-center px-4 text-[15px] leading-8', className)}
        {...rest}
      >
        {children}
      </span>
    )
  }
)

export default DropdownMenuItemLabel
