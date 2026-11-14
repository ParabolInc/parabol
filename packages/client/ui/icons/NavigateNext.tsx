import type {SVGProps} from 'react'
import {cn} from '../cn'

const NavigateNext = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
  </svg>
)

export default NavigateNext
