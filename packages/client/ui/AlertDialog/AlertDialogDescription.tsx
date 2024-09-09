import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import clsx from 'clsx'
import * as React from 'react'

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({className, ...props}, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={clsx('text-muted-foreground text-sm', className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName
