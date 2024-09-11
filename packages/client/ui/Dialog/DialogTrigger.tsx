import * as RadixDialog from '@radix-ui/react-dialog'
import React from 'react'

export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Trigger>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Trigger asChild ref={ref} {...props}>
    {children}
  </RadixDialog.Trigger>
))
