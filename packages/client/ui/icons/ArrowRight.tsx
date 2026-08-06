import type {SVGProps} from 'react'
import {cn} from '../cn'

const ArrowRight = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='m10 17 5-5-5-5z' />
  </svg>
)

export default ArrowRight
