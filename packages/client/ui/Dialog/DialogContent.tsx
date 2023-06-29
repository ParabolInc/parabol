import * as React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {twMerge} from 'tailwind-merge'

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({className, children, ...props}, ref) => (
  <RadixDialog.Content
    ref={ref}
    className={twMerge(
      'fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow',
      className
    )}
    {...props}
  >
    {children}
  </RadixDialog.Content>
))
