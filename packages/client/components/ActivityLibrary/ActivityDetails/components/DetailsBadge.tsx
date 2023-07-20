import React from 'react'
import clsx from 'clsx'

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
