import type {DropdownMenuContentProps} from '@radix-ui/react-dropdown-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {cn} from '../cn'

interface MenuContentProps extends DropdownMenuContentProps {
  className?: string
  children: React.ReactNode
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({className, children, ...props}, ref) => {
    return (
      <DropdownMenu.Content
        className={cn(
          'z-10 max-h-56 w-auto max-w-[400px] min-w-[200px] overflow-auto rounded-md bg-white py-1 shadow-lg outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    )
  }
)
