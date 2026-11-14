import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {useContext} from 'react'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'
import {NestedModalContext} from '../Modal/NestedModalContext'

export const MenuSubContent = forwardRadix<typeof DropdownMenu.SubContent>(
  ({className, children, ...props}, ref) => {
    const isNested = useContext(NestedModalContext)
    return (
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          ref={ref}
          sideOffset={4}
          alignOffset={-4}
          className={cn(
            'max-h-56 min-w-[160px] max-w-[400px] overflow-auto rounded-md py-1 shadow-[var(--shadow-card-raised)] outline-hidden',
            isNested ? 'z-40 bg-surface-modal-nested' : 'z-10 bg-surface-modal',
            className
          )}
          {...props}
        >
          {children}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    )
  }
)
