import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {Check} from '~/ui/icons'
import {cn} from '../cn'

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Item> {
  endAdornment?: React.ReactNode
  checkClassName?: string
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({className, children, endAdornment, checkClassName, ...props}, ref) => (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        'mx-1 flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-3 py-2 text-sm outline-hidden hover:bg-surface-hover focus:bg-surface-hover data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>

      <div className='flex items-center space-x-2'>
        <RadixSelect.ItemIndicator className='flex items-center'>
          <Check className={cn('h-5 w-5', checkClassName)} />
        </RadixSelect.ItemIndicator>
        {endAdornment && endAdornment}
      </div>
    </RadixSelect.Item>
  )
)
