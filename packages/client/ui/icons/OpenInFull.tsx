import type {SVGProps} from 'react'
import {cn} from '../cn'

const OpenInFull = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z' />
  </svg>
)

export default OpenInFull
