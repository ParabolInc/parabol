import * as RadixDialog from '@radix-ui/react-dialog'
import React from 'react'
import {twMerge} from 'tailwind-merge'

export const DialogDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={twMerge('mt-3 mb-5 text-base leading-normal', className)}
    {...props}
  >
    {children}
  </RadixDialog.Description>
))
