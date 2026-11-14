import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const MenuItemComponentAvatar = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('mr-2 flex h-6 w-6 min-w-6 items-center justify-center', className)}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default MenuItemComponentAvatar
