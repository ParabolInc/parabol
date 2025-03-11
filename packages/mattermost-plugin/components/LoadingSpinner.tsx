import {cn} from 'parabol-client/ui/cn'
import React from 'react'

type Props = {
  text?: React.ReactNode
  className?: string
}
const LoadingSpinner = ({text, className}: Props) => {
  return (
    <div className={cn('flex items-center', className)}>
      <div>
        <span className='fa fa-spinner fa-fw fa-pulse spinner' />
      </div>
      {text}
    </div>
  )
}

export default LoadingSpinner
