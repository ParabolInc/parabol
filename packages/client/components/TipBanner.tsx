import type {ReactNode} from 'react'
import {Info as InfoIcon} from '~/ui/icons'
import {cn} from '../ui/cn'

interface Props {
  children: ReactNode
  className?: string
  icon?: string
}

const TipBanner = (props: Props) => {
  const {children, className, icon} = props

  return (
    <div
      className={cn(
        'flex select-none rounded-[4px] border border-hairline-strong border-dashed p-[15px] text-sm leading-6',
        className
      )}
    >
      <div className='mr-4 h-6 w-6 text-fg-secondary'>{icon || <InfoIcon />}</div>
      <div>{children}</div>
    </div>
  )
}

export default TipBanner
