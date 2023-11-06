import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import {twMerge} from 'tailwind-merge'

interface MenuItemProps {
  value: string
  onClick: (value: string) => void
  isDisabled?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({value, onClick, isDisabled, icon, children}, ref) => {
    const itemClass = twMerge(
      'flex w-full items-center rounded-md px-4 py-3 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100',
      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
    )

    return (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => !isDisabled && onClick(value)}
        ref={ref}
      >
        {icon && <div className='mr-3 flex text-slate-700'>{icon}</div>}
        {children}
      </DropdownMenu.Item>
    )
  }
)
