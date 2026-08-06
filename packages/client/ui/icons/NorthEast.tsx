import type {SVGProps} from 'react'
import {cn} from '../cn'

const NorthEast = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z' />
  </svg>
)

export default NorthEast
