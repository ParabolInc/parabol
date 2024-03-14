import * as React from 'react'
import clsx from 'clsx'

const AlertDialogFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
AlertDialogFooter.displayName = 'AlertDialogFooter'
