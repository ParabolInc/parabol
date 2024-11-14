import clsx from 'clsx'
import * as React from 'react'

interface DetailsBadgeProps {
  className?: string
  children?: React.ReactNode
}

export const DetailsBadge = (props: DetailsBadgeProps) => {
  const {className, children} = props
  return (
    <div className={clsx('w-min rounded-full px-3 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}
