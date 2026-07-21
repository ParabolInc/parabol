import type {ComponentPropsWithoutRef} from 'react'
import {cn} from '../../ui/cn'
import BaseTag from './BaseTag'

const InactiveTag = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <BaseTag className={cn('bg-slate-600 text-white', className)} {...props} />
)

export default InactiveTag
