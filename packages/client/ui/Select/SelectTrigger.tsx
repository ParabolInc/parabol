import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import {KeyboardArrowDown} from '@mui/icons-material'
import {twMerge} from 'tailwind-merge'
import {renderLoader} from '../../utils/relay/renderLoader'

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  isLoading?: boolean
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({className, children, isLoading, ...props}, ref) => (
    <RadixSelect.Trigger
      ref={ref}
      className={twMerge(
        'flex h-11 w-full cursor-pointer items-center justify-between rounded border-2 border-slate-300 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-sky-500 data-[placeholder]:text-slate-600',
        className
      )}
      {...props}
    >
      {children}
      {isLoading && <div className='w-full pt-1'>{renderLoader()}</div>}
      <RadixSelect.Icon asChild>
        <KeyboardArrowDown className='h-5 w-5' />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
)
