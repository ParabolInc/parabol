import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import clsx from 'clsx'

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({className, ...props}, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={clsx('text-lg font-semibold', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName
