import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const MenuItemIcon = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('mr-2 h-[18px] w-[18px] text-fg-secondary [&_svg]:text-[18px]', className)}
      >
        {children}
      </div>
    )
  }
)

export default MenuItemIcon
