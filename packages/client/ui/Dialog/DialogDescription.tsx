import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'
import {twMerge} from 'tailwind-merge'

export const DialogDescription = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={twMerge('mb-5 mt-3 text-base leading-normal', className)}
    {...props}
  >
    {children}
  </RadixDialog.Description>
))
