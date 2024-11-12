import clsx from 'clsx'
import * as React from 'react'

interface Props {
  className?: string
  children?: React.ReactNode
}

export const ActivityBadge = (props: Props) => {
  const {className, children} = props

  return (
    <div className={clsx('rounded-full px-2 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}
