import {Check} from '@mui/icons-material'
import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Item> {
  endAdornment?: React.ReactNode
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({className, children, endAdornment, ...props}, ref) => (
    <RadixSelect.Item
      ref={ref}
      className={twMerge(
        'flex h-10 w-full cursor-pointer items-center justify-between rounded-sm text-sm outline-hidden select-none hover:bg-slate-100 focus:bg-slate-100 data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className='pl-2'>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </span>

      <div className='flex items-center space-x-2 pr-2'>
        <RadixSelect.ItemIndicator className='pt-1'>
          <Check className='h-5 w-5' />
        </RadixSelect.ItemIndicator>
        {endAdornment && endAdornment}
      </div>
    </RadixSelect.Item>
  )
)
