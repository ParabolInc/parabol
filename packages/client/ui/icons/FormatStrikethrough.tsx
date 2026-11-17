import type {SVGProps} from 'react'
import {cn} from '../cn'

const FormatStrikethrough = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M10 19h4v-3h-4zM5 4v3h5v3h4V7h5V4zM3 14h18v-2H3z' />
  </svg>
)

export default FormatStrikethrough
