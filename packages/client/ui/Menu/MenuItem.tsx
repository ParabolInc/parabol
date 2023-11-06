import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import {twMerge} from 'tailwind-merge'

interface MenuItemProps {
  onClick: (event: Event) => void
  isDisabled?: boolean
  children: React.ReactNode
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({onClick, isDisabled, children}, ref) => {
    const itemClass = twMerge(
      'flex w-full items-center rounded-md px-4 py-3 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100',
      isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    )

    return (
      <DropdownMenu.Item className={itemClass} onSelect={onClick} ref={ref}>
        {children}
      </DropdownMenu.Item>
    )
  }
)
