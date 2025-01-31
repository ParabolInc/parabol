import {KeyboardArrowDown} from '@mui/icons-material'
import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'
import {twMerge} from 'tailwind-merge'
import {Loader} from '../../utils/relay/renderLoader'

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  isLoading?: boolean
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({className, children, isLoading, ...props}, ref) => (
    <RadixSelect.Trigger
      ref={ref}
      className={twMerge(
        'flex h-11 w-full cursor-pointer items-center justify-between rounded-sm border border-slate-500 bg-transparent px-2 py-1 text-sm focus:outline-hidden focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-slate-600 data-[state=open]:border-sky-500',
        className
      )}
      {...props}
    >
      {children}
      {isLoading && <div className='w-full pt-1'>{<Loader />}</div>}
      <RadixSelect.Icon asChild>
        <KeyboardArrowDown className='h-5 w-5' />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
)
