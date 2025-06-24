import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {cn} from '../cn'

interface MenuItemProps {
  onClick: (event: Event) => void
  isDisabled?: boolean
  className?: string
  children: React.ReactNode
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({onClick, isDisabled, className, children}, ref) => {
    return (
      <DropdownMenu.Item
        className={cn(
          'flex w-full items-center rounded-md px-4 py-3 text-sm text-slate-700 outline-hidden hover:bg-slate-100 focus:bg-slate-100',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className
        )}
        // FIX ME: onClick has a MouseEvent handler, onSelect has a custom event that can't do things like e.stopPropagation()
        // Refactor: onClick -> onSelect here & in all dependencies
        onSelect={onClick}
        ref={ref}
      >
        {children}
      </DropdownMenu.Item>
    )
  }
)
