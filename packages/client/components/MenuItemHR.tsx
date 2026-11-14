import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const MenuItemHR = forwardRef<HTMLHRElement, ComponentPropsWithoutRef<'hr'>>((props, ref) => {
  const {className, ...rest} = props
  return (
    <hr
      ref={ref}
      className={cn('my-2 h-px border-none bg-hairline-strong p-0', className)}
      {...rest}
    />
  )
})

export default MenuItemHR
