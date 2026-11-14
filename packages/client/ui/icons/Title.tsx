import type {SVGProps} from 'react'
import {cn} from '../cn'

const Title = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M5 4v3h5.5v12h3V7H19V4z' />
  </svg>
)

export default Title
