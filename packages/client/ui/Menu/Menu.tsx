import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import {twMerge} from 'tailwind-merge'

interface MenuProps extends DropdownMenu.DropdownMenuProps {
  className?: string
  trigger: React.ReactNode
  sideOffset?: number
  side?: 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({align = 'end', trigger, className, children, sideOffset = 10, side, ...props}, ref) => {
    return (
      <DropdownMenu.Root {...props}>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            className={twMerge(
              'border-rad w-auto min-w-[200px] max-w-[400px] rounded-md bg-white shadow-lg outline-none',
              className
            )}
            side={side}
            sideOffset={sideOffset}
            ref={ref}
          >
            {children}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
)
