import * as RadixDialog from '@radix-ui/react-dialog'
import React from 'react'
import {twMerge} from 'tailwind-merge'

export const DialogTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={twMerge('m-0 text-xl font-semibold', className)}
    {...props}
  >
    {children}
  </RadixDialog.Title>
))
