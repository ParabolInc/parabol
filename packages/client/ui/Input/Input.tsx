import * as React from 'react'

import {twMerge} from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, ...props}, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          'flex h-11 w-full rounded border-2 border-slate-300 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-slate-600',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
