import type {SVGProps} from 'react'
import {cn} from '../cn'

const KeyboardArrowLeft = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z' />
  </svg>
)

export default KeyboardArrowLeft
