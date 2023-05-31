import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import clsx from 'clsx'

const Select = SelectPrimitive.Root

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={clsx(
      'ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex w-full justify-between rounded-md bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    {/* <SelectPrimitive.Icon asChild> */}
    {/* <ChevronDown className='h-4 w-4 opacity-50' /> */}
    {/* </SelectPrimitive.Icon> */}
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({className, children, position = 'popper', ...props}, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={clsx(
        'bg-popover text-popover-foreground animate-in fade-in-80 relative z-50 min-w-[8rem] overflow-hidden rounded-md shadow-md',
        position === 'popper' && 'translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={clsx(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

export {Select, SelectTrigger, SelectContent}
