import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {cn} from '../cn'

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({className, children, position = 'popper', ...props}, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        'relative z-50 overflow-hidden rounded-sm bg-surface-card shadow-[var(--shadow-card-raised)]',
        className
      )}
      position={position}
      {...props}
    >
      <RadixSelect.Viewport
        className={cn(
          'py-1',
          position === 'popper' &&
            'min-h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)'
        )}
      >
        {children}
      </RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
