import {Close} from '@mui/icons-material'
import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'
import {twMerge} from 'tailwind-merge'

export const DialogClose = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Close>
>(({className, ...props}, ref) => (
  <RadixDialog.Close asChild>
    <button
      ref={ref}
      className={twMerge(
        'absolute top-4 right-4 inline-flex h-6 w-6 cursor-pointer appearance-none items-center justify-center bg-transparent',
        className
      )}
      aria-label='Close'
      {...props}
    >
      <Close className='text-slate-500 hover:opacity-50' />
    </button>
  </RadixDialog.Close>
))
