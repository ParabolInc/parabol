import * as React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {twMerge} from 'tailwind-merge'

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({className, ...props}, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={twMerge(
      'fixed inset-0 bg-slate-700/[.3] data-[state=open]:animate-overlayShow',
      className
    )}
    {...props}
  />
))
