import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'
import {cn} from '../cn'

export const DialogDescription = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn('mt-3 mb-5 text-base leading-normal', className)}
    {...props}
  >
    {children}
  </RadixDialog.Description>
))
