import type {SVGProps} from 'react'
import {cn} from '../cn'

const FormatH1 = ({className, ...props}: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 -960 960 960'
    aria-hidden='true'
    focusable='false'
    {...props}
    className={cn(
      'inline-block h-[1em] w-[1em] shrink-0 select-none fill-current text-[24px]',
      className
    )}
  >
    <path d='M200-280v-400h80v160h160v-160h80v400h-80v-160H280v160h-80Zm480 0v-320h-80v-80h160v400h-80Z' />
  </svg>
)

export default FormatH1
