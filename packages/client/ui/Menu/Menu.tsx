import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import {twMerge} from 'tailwind-merge'

interface MenuProps extends DropdownMenu.DropdownMenuProps {
  className?: string
  trigger: React.ReactNode
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({trigger, className, children, ...props}, ref) => {
    return (
      <DropdownMenu.Root {...props}>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align='end'
            className={twMerge(
              'border-rad w-auto min-w-[200px] rounded-md bg-white shadow-lg outline-none',
              className
            )}
            sideOffset={10}
            ref={ref}
          >
            {children}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
)
