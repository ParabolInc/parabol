import type {SVGProps} from 'react'
import {cn} from '../cn'

const TextFields = ({className, ...props}: SVGProps<SVGSVGElement>) => (
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
    <path d='M2.5 4v3h5v12h3V7h5V4zm19 5h-9v3h3v7h3v-7h3z' />
  </svg>
)

export default TextFields
