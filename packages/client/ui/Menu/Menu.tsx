import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'

interface MenuProps {
  trigger: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({trigger, children}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          className='border-rad w-auto min-w-[200px] max-w-[400px] rounded-md bg-white shadow-lg outline-none'
          sideOffset={6}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
