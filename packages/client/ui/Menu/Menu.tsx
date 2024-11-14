import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'

interface MenuProps extends DropdownMenu.DropdownMenuProps {
  className?: string
  trigger: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({trigger, className, children, ...props}) => {
  return (
    <DropdownMenu.Root {...props}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>{children}</DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
