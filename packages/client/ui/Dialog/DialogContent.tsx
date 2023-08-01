import * as React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {twMerge} from 'tailwind-merge'
import {DialogOverlay} from './DialogOverlay'
import {DialogClose} from './DialogClose'

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Portal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={twMerge(
        'md:w-2xl fixed top-[50%] left-[50%] max-h-[85vh] w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-dialog focus:outline-none md:max-w-2xl',
        className
      )}
      {...props}
    >
      {children}
      <DialogClose />
    </RadixDialog.Content>
  </RadixDialog.Portal>
))
