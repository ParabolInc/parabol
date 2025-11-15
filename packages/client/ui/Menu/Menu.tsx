import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type * as React from 'react'

interface MenuProps extends DropdownMenu.DropdownMenuProps {
  className?: string
  trigger: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({trigger, children, ...props}) => {
  return (
    <DropdownMenu.Root {...props}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>{children}</DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
