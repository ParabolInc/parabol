import type {SVGProps} from 'react'
import {cn} from '../cn'

const Add = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z' />
  </svg>
)

export default Add
