import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'
import {cn} from '../cn'

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({className, ...props}, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      'border border-hairline-strong bg-transparent px-2.5 py-1 font-semibold text-fg-primary hover:bg-surface-hover',
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName
