import * as React from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  className?: string
  children?: React.ReactNode
}

const ActivityDetailsBadge = (props: Props) => {
  const {className, children} = props
  return (
    <div className={cn('w-max rounded-full px-3 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}

export default ActivityDetailsBadge
