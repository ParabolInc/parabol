import type * as React from 'react'
import {cn} from '../../../../ui/cn'

interface DetailsBadgeProps {
  className?: string
  children?: React.ReactNode
}

export const DetailsBadge = (props: DetailsBadgeProps) => {
  const {className, children} = props
  return (
    <div className={cn('w-min rounded-full px-3 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}
