import type {SVGProps} from 'react'
import {cn} from '../cn'

const Check = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
  </svg>
)

export default Check
