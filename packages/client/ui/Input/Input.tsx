import * as React from 'react'

import {twMerge} from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// TODO
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, ...props}, ref) => {
    return <input type={type} className={twMerge('flex', className)} ref={ref} {...props} />
  }
)
