import type {SVGProps} from 'react'
import {cn} from '../cn'

const FormatH3 = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M120-280v-400h80v160h160v-160h80v400h-80v-160H200v160h-80Zm400 0v-80h240v-80H600v-80h160v-80H520v-80h240q33 0 56.5 23.5T840-600v240q0 33-23.5 56.5T760-280H520Z' />
  </svg>
)

export default FormatH3
