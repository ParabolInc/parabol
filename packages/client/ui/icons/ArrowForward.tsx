import type {SVGProps} from 'react'
import {cn} from '../cn'

const ArrowForward = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' />
  </svg>
)

export default ArrowForward
