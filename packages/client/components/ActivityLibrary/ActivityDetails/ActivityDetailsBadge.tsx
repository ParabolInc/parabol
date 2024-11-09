import clsx from 'clsx'
import * as React from 'react'

interface Props {
  className?: string
  children?: React.ReactNode
}

const ActivityDetailsBadge = (props: Props) => {
  const {className, children} = props
  return (
    <div className={clsx('w-max rounded-full px-3 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}

export default ActivityDetailsBadge
