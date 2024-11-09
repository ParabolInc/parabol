import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'

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
        className={twMerge(
          'flex w-full items-center rounded-md px-4 py-3 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className
        )}
        onSelect={onClick}
        ref={ref}
      >
        {children}
      </DropdownMenu.Item>
    )
  }
)
