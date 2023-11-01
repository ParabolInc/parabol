import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'

interface MenuItemProps {
  value: string
  label: string
  onClick: (value: string) => void
  isDisabled?: boolean
  icon?: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = (props: MenuItemProps) => {
  const {value, label, onClick, isDisabled, icon} = props

  return (
    <DropdownMenu.Item
      className={`flex w-full items-center rounded-md px-6 py-3 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100 ${
        isDisabled ? 'cursor-not-allowed ' : 'cursor-pointer'
      }`}
      onSelect={() => !isDisabled && onClick(value)}
    >
      {icon && <div className='mr-3 flex text-slate-700'>{icon}</div>}
      {label}
    </DropdownMenu.Item>
  )
}
