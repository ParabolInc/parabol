import CloseIcon from '@mui/icons-material/Close'
import * as RadixDialog from '@radix-ui/react-dialog'
import {forwardRef} from 'react'
import {cn} from '../cn'

export const DialogClose = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Close>
>(({className, ...props}, ref) => (
  <RadixDialog.Close asChild>
    <button
      ref={ref}
      className={cn(
        'absolute top-4 right-4 inline-flex h-6 w-6 cursor-pointer appearance-none items-center justify-center bg-transparent',
        className
      )}
      aria-label='Close'
      {...props}
    >
      <CloseIcon className='text-fg-muted hover:opacity-50' />
    </button>
  </RadixDialog.Close>
))
