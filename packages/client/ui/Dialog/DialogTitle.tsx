import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'
import {cn} from '../cn'

export const DialogTitle = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Title ref={ref} className={cn('m-0 font-semibold text-xl', className)} {...props}>
    {children}
  </RadixDialog.Title>
))
