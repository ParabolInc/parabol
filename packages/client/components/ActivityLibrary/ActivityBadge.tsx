import type * as React from 'react'
import {cn} from '../../ui/cn'

interface Props {
  className?: string
  children?: React.ReactNode
}

export const ActivityBadge = (props: Props) => {
  const {className, children} = props

  return (
    <div className={cn('rounded-full px-2 py-1 text-xs font-semibold', className)}>{children}</div>
  )
}
