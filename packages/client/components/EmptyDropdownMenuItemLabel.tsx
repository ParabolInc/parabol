import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'
import MenuItemLabel from './MenuItemLabel'

export const EmptyDropdownMenuItemLabel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <MenuItemLabel
      ref={ref}
      className={cn('justify-center px-2 text-fg-secondary italic', className)}
      {...rest}
    >
      {children}
    </MenuItemLabel>
  )
})
