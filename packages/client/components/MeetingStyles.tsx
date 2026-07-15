import type {ComponentPropsWithoutRef} from 'react'
import {cn} from '../ui/cn'

const MeetingStyles = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex h-full bg-surface-app', className)} {...props} />
)

export default MeetingStyles
