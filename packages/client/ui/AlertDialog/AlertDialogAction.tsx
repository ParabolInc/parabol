import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'
import {cn} from '../cn'

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({className, ...props}, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      'bg-linear-to-r from-tomato-600 to-rose-500 font-semibold text-white hover:opacity-90',
      className
    )}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName
