import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({className, children, position = 'popper', ...props}, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={twMerge(
        'relative z-50 overflow-hidden rounded-sm bg-white shadow-card-1',
        className
      )}
      position={position}
      {...props}
    >
      <RadixSelect.Viewport
        className={twMerge(
          'p-0',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
