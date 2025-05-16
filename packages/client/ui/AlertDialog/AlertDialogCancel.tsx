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
      'border border-slate-400 bg-transparent px-2.5 py-1 font-semibold text-slate-900 hover:bg-slate-200',
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName
