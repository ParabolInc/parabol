import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'

interface MenuItemProps {
  value: string
  label: string
  onClick: (value: string) => void
  isDisabled?: boolean
}

export const MenuItem: React.FC<MenuItemProps> = (props: MenuItemProps) => {
  const {value, label, onClick, isDisabled} = props

  return (
    <DropdownMenu.Item
      className={`flex w-full items-center rounded-md px-6 py-3 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100 ${
        isDisabled ? 'cursor-not-allowed text-slate-600' : 'cursor-pointer'
      }`}
      onSelect={() => !isDisabled && onClick(value)}
    >
      {label}
    </DropdownMenu.Item>
  )
}
