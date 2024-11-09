import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'

export const DialogTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Trigger>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Trigger asChild ref={ref} {...props}>
    {children}
  </RadixDialog.Trigger>
))
