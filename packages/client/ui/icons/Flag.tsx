import type {SVGProps} from 'react'
import {cn} from '../cn'

const Flag = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z' />
  </svg>
)

export default Flag
