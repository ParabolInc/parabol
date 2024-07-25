import clsx from 'clsx'
import * as React from 'react'

const AlertDialogHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)
AlertDialogHeader.displayName = 'AlertDialogHeader'
