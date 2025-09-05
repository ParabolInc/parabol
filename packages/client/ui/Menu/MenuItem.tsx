import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {cn} from '../cn'

interface MenuItemProps {
  onSelect?: (event: Event) => void
  onClick?: React.MouseEventHandler
  isDisabled?: boolean
  className?: string
  children: React.ReactNode
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({onSelect, onClick, isDisabled, className, children}, ref) => {
    return (
      <DropdownMenu.Item
        className={cn(
          'flex w-full items-center rounded-md px-4 py-3 text-slate-700 text-sm outline-hidden hover:bg-slate-100 focus:bg-slate-100',
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
