import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import {Check} from '@mui/icons-material'
import {twMerge} from 'tailwind-merge'

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({className, children, ...props}, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={twMerge(
      'relative flex w-full cursor-pointer select-none items-center rounded py-2 text-sm outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className='absolute right-2 top-2 flex items-center justify-center'>
      <RadixSelect.ItemIndicator>
        <Check className='h-5 w-5' />
      </RadixSelect.ItemIndicator>
    </span>

    <span className='pl-2'>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </span>
  </RadixSelect.Item>
))
