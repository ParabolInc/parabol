import type {DropdownMenuContentProps} from '@radix-ui/react-dropdown-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import {cn} from '../cn'
import {NestedModalContext} from '../Modal/NestedModalContext'

interface MenuContentProps extends DropdownMenuContentProps {
  className?: string
  children: React.ReactNode
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({className, children, ...props}, ref) => {
    const isNested = React.useContext(NestedModalContext)
    return (
      <DropdownMenu.Content
        className={cn(
          'my-0.5 max-h-56 w-auto min-w-[200px] max-w-[400px] overflow-auto rounded-md py-1 shadow-[var(--shadow-card-raised)] outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up',
          isNested ? 'z-40 bg-surface-modal-nested' : 'z-10 bg-surface-modal',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    )
  }
)
