import type {SVGProps} from 'react'
import {cn} from '../cn'

const FormatH2 = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M120-280v-400h80v160h160v-160h80v400h-80v-160H200v160h-80Zm400 0v-160q0-33 23.5-56.5T600-520h160v-80H520v-80h240q33 0 56.5 23.5T840-600v80q0 33-23.5 56.5T760-440H600v80h240v80H520Z' />
  </svg>
)

export default FormatH2
