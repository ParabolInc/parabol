import type {SVGProps} from 'react'
import {cn} from '../cn'

const KeyboardArrowRight = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z' />
  </svg>
)

export default KeyboardArrowRight
