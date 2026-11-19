import type {SVGProps} from 'react'
import {cn} from '../cn'

const PriorityHigh = ({className, ...props}: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    focusable='false'
    {...props}
    className={cn(
      'inline-block h-[1em] w-[1em] shrink-0 select-none fill-current text-[24px]',
      className
    )}
  >
    <circle cx='12' cy='19' r='2' />
    <path d='M10 3h4v12h-4z' />
  </svg>
)

export default PriorityHigh
