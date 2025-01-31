import type {DropdownMenuContentProps} from '@radix-ui/react-dropdown-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'

interface MenuContentProps extends DropdownMenuContentProps {
  className?: string
  children: React.ReactNode
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({className, children, ...props}, ref) => {
    return (
      <DropdownMenu.Content
        className={twMerge(
          'border-rad z-10 w-auto max-w-[400px] min-w-[200px] rounded-md bg-white shadow-lg outline-hidden',
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
