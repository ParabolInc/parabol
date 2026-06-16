import type * as React from 'react'
import {cn} from '../cn'

export const DialogActions = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
)
