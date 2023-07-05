import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import {KeyboardArrowDown} from '@mui/icons-material'
import {twMerge} from 'tailwind-merge'

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({className, children, ...props}, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={twMerge(
      'flex h-10 w-full cursor-pointer items-center justify-between rounded border-2 border-slate-300 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-sky-500 data-[placeholder]:text-slate-600',
      className
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon asChild>
      <KeyboardArrowDown className='h-5 w-5' />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
))
