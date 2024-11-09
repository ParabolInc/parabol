import * as React from 'react'
import {twMerge} from 'tailwind-merge'

export const DialogActions = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('mt-6 flex justify-end space-x-2', className)} {...props} />
)
