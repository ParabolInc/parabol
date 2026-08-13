import type {SVGProps} from 'react'
import {cn} from '../cn'

const Send = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M2.01 21 23 12 2.01 3 2 10l15 2-15 2z' />
  </svg>
)

export default Send
