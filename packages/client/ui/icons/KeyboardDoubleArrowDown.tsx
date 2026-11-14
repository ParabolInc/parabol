import type {SVGProps} from 'react'
import {cn} from '../cn'

const KeyboardDoubleArrowDown = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z' />
    <path d='M18 13.41 16.59 12 12 16.58 7.41 12 6 13.41l6 6z' />
  </svg>
)

export default KeyboardDoubleArrowDown
