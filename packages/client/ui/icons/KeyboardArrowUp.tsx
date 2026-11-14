import type {SVGProps} from 'react'
import {cn} from '../cn'

const KeyboardArrowUp = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z' />
  </svg>
)

export default KeyboardArrowUp
