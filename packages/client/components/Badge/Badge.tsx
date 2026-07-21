import type {ComponentPropsWithoutRef} from 'react'
import {cn} from '../../ui/cn'

const Badge = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'h-4 min-w-4 rounded-2xl bg-tomato-500 px-1 text-center font-semibold text-white text-xs leading-4 shadow-[1px_1px_2px_rgba(0,0,0,.5)]',
      className
    )}
    {...props}
  />
)

export default Badge
