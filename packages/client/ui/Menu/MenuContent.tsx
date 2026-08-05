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
          // shadow-lg is a black-based drop shadow that all but disappears on a dark surface, so on
          // dark the menu needs an explicit edge to separate it from a same-colored surface-card
          // page behind it (same fix as DialogContent/SpotlightModal)
          'z-10 max-h-56 w-auto min-w-[200px] max-w-[400px] overflow-auto rounded-md bg-surface-card py-1 shadow-lg outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up dark:border dark:border-hairline-strong',
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
