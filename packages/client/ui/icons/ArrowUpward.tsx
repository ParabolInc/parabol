import type {SVGProps} from 'react'
import {cn} from '../cn'

const ArrowUpward = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z' />
  </svg>
)

export default ArrowUpward
