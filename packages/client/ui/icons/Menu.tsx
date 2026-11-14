import type {SVGProps} from 'react'
import {cn} from '../cn'

const Menu = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z' />
  </svg>
)

export default Menu
