import type {SVGProps} from 'react'
import {cn} from '../cn'

const GridOn = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M8 20H4v-4h4zm0-6H4v-4h4zm0-6H4V4h4zm6 12h-4v-4h4zm0-6h-4v-4h4zm0-6h-4V4h4zm6 12h-4v-4h4zm0-6h-4v-4h4zm0-6h-4V4h4z' />
  </svg>
)

export default GridOn
