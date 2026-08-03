import {KeyboardArrowDown} from '@mui/icons-material'
import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {Loader} from '../../utils/relay/renderLoader'
import {cn} from '../cn'

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  isLoading?: boolean
  iconClassName?: string
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({className, children, isLoading, iconClassName, ...props}, ref) => (
    <RadixSelect.Trigger
      ref={ref}
      className={cn(
        'flex h-11 w-full cursor-pointer items-center justify-between rounded-sm border border-hairline-field bg-transparent px-2 py-1 text-sm focus:outline-hidden focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-accent data-placeholder:text-fg-muted',
        className
      )}
      {...props}
    >
      {children}
      {isLoading && <div className='w-full pt-1'>{<Loader />}</div>}
      <RadixSelect.Icon className={iconClassName}>
        <KeyboardArrowDown className='h-5 w-5' />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
)
