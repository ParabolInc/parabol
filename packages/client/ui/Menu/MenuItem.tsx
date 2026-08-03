import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {cn} from '../cn'

interface MenuItemProps {
  onSelect?: (event: Event) => void
  onClick?: React.MouseEventHandler
  isDisabled?: boolean
  className?: string
  // renders the child as the menu item itself, e.g. a <Link>, so selecting it both navigates & closes the menu
  asChild?: boolean
  children: React.ReactNode
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({onSelect, onClick, isDisabled, className, asChild, children}, ref) => {
    return (
      <DropdownMenu.Item
        asChild={asChild}
        className={cn(
          'mx-1 flex items-center rounded-md px-4 py-1 text-fg-primary text-sm outline-hidden hover:bg-surface-hover focus:bg-surface-hover',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className
        )}
        // FIX ME: onClick has a MouseEvent handler, onSelect has a custom event that can't do things like e.stopPropagation()
        // Refactor: onClick -> onSelect here & in all dependencies
        onSelect={onSelect}
        onClick={onClick}
        ref={ref}
      >
        {children}
      </DropdownMenu.Item>
    )
  }
)
