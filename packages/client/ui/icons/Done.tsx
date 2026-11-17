import type {SVGProps} from 'react'
import {cn} from '../cn'

const Done = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' />
  </svg>
)

export default Done
