import * as React from 'react'

import {twMerge} from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, ...props}, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          'flex h-11 w-full rounded-sm border border-slate-500 bg-transparent px-2 py-1 text-sm focus:outline-hidden focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-slate-600',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
