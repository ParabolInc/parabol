import type {SVGProps} from 'react'
import {cn} from '../cn'

const FilterList = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z' />
  </svg>
)

export default FilterList
