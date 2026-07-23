import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type * as React from 'react'

interface MenuProps extends DropdownMenu.DropdownMenuProps {
  className?: string
  trigger: React.ReactNode
}

export const Menu = ({trigger, children, ...props}: MenuProps) => {
  return (
    // modal would render a dismiss layer over the page, so the click that closes the
    // menu gets swallowed instead of landing on whatever was clicked
    <DropdownMenu.Root modal={false} {...props}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>{children}</DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
