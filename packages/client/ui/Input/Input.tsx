import * as React from 'react'

import {cn} from '../cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, ...props}, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-sm border border-hairline-field bg-transparent px-2 py-1 text-sm focus:outline-hidden focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-fg-muted',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
